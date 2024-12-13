"use server";
import OpenAI from "openai";
import type { Tool } from "ai";
import { runFunction, availableFunctions, FunctionName } from "./functions";
import { columnTypes } from "./columns";
import { BaseColumnType } from "./columns/BaseColumnType";
import { createGist as createGistOnGitHub } from "./utils/github";
const MAX_ROWS = 1000;

export type Option = {
  title: string;
  description: string;
};

export type PrimaryDataType = "issue" | "commit" | "pull-request" | "snippet" | "item";
type GridCellState = "empty" | "generating" | "done" | "error";

export type ColumnType = "text" | "select" | "select-user" | "file" | "issue-pr" | "commit";

export type ColumnResponse = {
  text: string;
  select: { option: string } | { options: string[] };
  "select-user": { user: string } | { users: string[] };
  file: { file: { path: string; repository: string } } | { files: { path: string; repository: string }[] };
  "issue-pr": {
    reference?: {
      number: number;
      repository: string;
      type: 'issue' | 'pull-request';
      title?: string;
    };
    references?: Array<{
      number: number;
      repository: string;
      type: 'issue' | 'pull-request';
      title?: string;
    }>;
  };
  "commit": {
    commit?: {
      sha: string;
      repository: string;
      message?: string;
    };
    commits?: Array<{
      sha: string;
      repository: string;
      message?: string;
    }>;
  };
  boolean: boolean;
};

export type GridCell<T extends keyof ColumnResponse = ColumnType> = {
  columnType: T;
  response: ColumnResponse[T];
  columnTitle: string;
  columnInstructions: string;
  context: any;
  hydrationSources: string[];
  options?: Option[];
  prompt?: string;
  state: GridCellState;
  errorMessage?: string;
  multiple?: boolean;
};

export type GridCol = {
  title: string;
  instructions: string;
  type: ColumnType;
  options?: Option[];
  cells: GridCell[];
  multiple?: boolean;
};

export type GridState = {
  columns: GridCol[];
  primaryColumn: GridCell[];
  title: string;
  primaryColumnType: PrimaryDataType;
  groupBy?: string;
  filterByKey?: string;
  filterByValue?: string;
};

export type ActionResponse = {
  success: boolean;
  grid: GridState;
};

export type SuccessfulPrimaryColumnResponse = {
  success: true;
  grid: GridState;
};

export type ErrorResponse = {
  success: false;
  message: string;
};

function convertResultToPrimaryCell(result: any): GridCell {
  return {
    context: result,
    state: "done",
    columnType: "text",
    columnInstructions: "",
    columnTitle: result.type,
    hydrationSources: [],
    response: result.value as ColumnResponse["text"],
  };
}

function signatureFromArgs(args: Record<string, unknown>) {
  return Object.entries(args)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
}

const GH_MODELS_ENDPOINT = "https://models.inference.ai.azure.com";
const shouldUseGitHubModels = !!process.env.GITHUB_MODELS;
const MODEL = shouldUseGitHubModels ? "gpt-4o" : "gpt-4o-2024-08-06";

const oaiParams = shouldUseGitHubModels
  ? {
      baseURL: GH_MODELS_ENDPOINT,
      apiKey: process.env.GITHUB_PAT,
    }
  : {
      apiKey: process.env.OPENAI_API_KEY,
    };
const openai = new OpenAI(oaiParams);

const tools: Tool[] = Object.keys(availableFunctions).map((f) => {
  return {
    type: "function",
    function: availableFunctions[f as FunctionName].meta,
  } as Tool;
});

export async function createPrimaryColumn(
  primaryQuery: string,
): Promise<SuccessfulPrimaryColumnResponse | ErrorResponse> {
  const SYSTEM = `\
  You have access to a number of tools that allow you to retrieve context from GitHub.com.\
  When asked by users, utilize the correct tool to retrieve the data that the user is requesting.\
  You are only able to call one tool per user message. When a tool is used, the result of the tool use will be provided directly to the user.`;
  const response = await openai.chat.completions.create({
    model: MODEL,
    stream: false,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: primaryQuery },
    ],
    tools,
    tool_choice: "auto",
  });

  const responseMessage = response.choices[0].message;

  if (responseMessage?.tool_calls?.length) {
    const toolCall = responseMessage.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments);
    const toolResult = await runFunction(toolCall.function.name, args);
    let column = (Array.isArray(toolResult) ? toolResult : [toolResult])
      .map(convertResultToPrimaryCell)
      .slice(0, MAX_ROWS);
    const grid = {
      title: primaryQuery,
      columns: [],
      primaryColumn: column,
      primaryColumnType: column[0].context.type || ("Item" as PrimaryDataType),
    };

    return { success: true, grid };
  }

  return {
    success: false,
    message: responseMessage.content || "Something went wrong",
  };
}

type HydrateResponse = {
  promise: Promise<GridCell>;
};

const optionString = (option: Option) =>
  `-  ${option.title}: ${option.description}`;

export async function hydrateCell(cell: GridCell): Promise<HydrateResponse> {
  const SYSTEM = `\
  You have access to a number of tools that allow you to retrieve context from GitHub.com.\
  You may use multiple tools in sequence or parallel. 
  Your responses will be used to populate a data grid. You should avoid asking clarifying questions, or being overly conversational.\
  You will receive a user message that contains two things:\n
  1) Context: A JSON object representing some artifact from GitHub.com. It could be an issue, pull request, commit, file, etc
  2) Instructions: A user-provided set of instructions that describe how you should populate a cell value based on the context provided. \n
  In some cases, the context object will contain the answer. In other cases, you will need to use tools to find the answer.\
  The user interface is not a chat interface, so you should avoid introductions, goodbyes, or any other pleasantries.\
  You must provide the answer to the user's question as concisely as possible.

  Cells will have different format instructions based on the expected data type of the column. It's critical that you adhere to the format instructions.\
  `;

  async function hydrate<T extends ColumnType>(): Promise<GridCell<T>> {
    let hydrationSources: string[] = [];
    const columnType = columnTypes[
      cell.columnType as ColumnType
    ] as BaseColumnType<ColumnType>;
    const prompt: OpenAI.Chat.Completions.ChatCompletionUserMessageParam = {
      role: "user",
      content: `Context: ${JSON.stringify(cell.context)}
      - Cell format instructions: ${columnType.buildHydrationPrompt(cell as GridCell<T>)}
      - Cell data description (use this to determine relevant data for the cell): ${cell.columnTitle}
      ${cell.columnInstructions ? `- Additional instructions: ${cell.columnInstructions}` : ""}
      ${cell.options ? `User-provided options:\n${cell.options.map(optionString).join("\n")}` : "No options provided"}`,
    };

    let context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM },
      prompt,
    ];

    async function run() {
      const response = await openai.chat.completions.create({
        model: MODEL,
        stream: false,
        messages: context,
        tools,
        tool_choice: "auto",
        response_format: columnType.generateResponseSchema(
          cell.options,
          cell.multiple,
        ),
      });

      const responseChoice = response.choices[0];
      const toolCalls = responseChoice.message.tool_calls;

      context.push(responseChoice.message);

      if (toolCalls?.length) {
        const toolCall = toolCalls[0];
        const args = JSON.parse(toolCall.function.arguments);
        const toolResult = await runFunction(toolCall.function.name, args);
        const signature = `${toolCall.function.name}(${signatureFromArgs(
          args,
        )})`;
        hydrationSources.push(signature);
        context.push({
          role: "tool",
          content: JSON.stringify(toolResult),
          tool_call_id: toolCall.id,
        });

        return run();
      }
    }

    await run();

    const responseContent = context[context.length - 1].content as string;

    if (!responseContent) {
      return {
        ...cell,
        state: "error",
        errorMessage: "Empty response. Weird, huh?",
      } as GridCell<T>;
    }

    return {
      ...cell,
      prompt: prompt.content as string,
      response: columnType.parseResponse(
        responseContent,
        cell.multiple,
      ) as ColumnResponse[T],
      state: "done",
      hydrationSources,
      errorMessage: undefined,
    } as GridCell<T>;
  }

  // pause to prevent rate limiting
  const shouldUseGitHubModels = !!process.env.GITHUB_MODELS;
  const TIMEOUT = shouldUseGitHubModels ? 5050 : 200;
  await new Promise((resolve) => setTimeout(resolve, TIMEOUT));

  // https://www.youtube.com/watch?v=CDZg3maL9q0
  // this is a hack to allow this action to be called in parallel. Otherwise, each call would be sequential
  return {
    promise: hydrate(),
  };
}

export async function createGist(filename: string, content: string): Promise<string> {
  'use server';
  try {
    const gistUrl = await createGistOnGitHub(filename, content);
    return gistUrl;
  } catch (error) {
    console.error("Failed to create gist:", error);
    throw new Error("Failed to create gist");
  }
}
