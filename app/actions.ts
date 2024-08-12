"use server";
import OpenAI from "openai";
import type { Tool } from "ai";
import { runFunction, availableFunctions, FunctionName } from "./functions";
import { getResponseFormat } from "./utils/schemas";
const MAX_ROWS = 25;

type PrimaryDataType = "issue" | "commit" | "pull-request" | "snippet" | "item";
type GridCellState = "empty" | "generating" | "done" | "error";
export type ColumnType = "text" | "single-select" | "multi-select" | "single-select-user" | "multi-select-user";
export type SingleSelectResponse = { option: string };
export type MultiSelectResponse = { options: string[] };
export type SingleSelectUserResponse = { user: string };
export type MultiSelectUserResponse = { users: string[] };
type TextResponse = string;

export type Option = {
  title: string;
  description: string;
};

type TextCell = {
  columnType: "text";
  response: TextResponse;
};

type SingleSelectCell = {
  columnType: "single-select";
  response: SingleSelectResponse;
};

type MultiSelectCell = {
  columnType: "multi-select";
  response: MultiSelectResponse;
};

type SingleSelectUserCell = {
  columnType: "single-select-user";
  response: SingleSelectUserResponse;
};

type MultiSelectUserCell = {
  columnType: "multi-select-user";
  response: MultiSelectUserResponse;
};

type CellTypes = TextCell | SingleSelectCell | MultiSelectCell | SingleSelectUserCell | MultiSelectUserCell;

type GridCellBase = CellTypes & {
  columnTitle: string;
  columnInstructions: string;
  context: any;
  hydrationSources: string[];
  options?: Option[];
  prompt?: string;
};

type GridCellWithError = GridCellBase & {
  state: "error";
  errorMessage: string;
};

type GridCellWithoutError = GridCellBase & {
  state: Exclude<GridCellState, "error">;
  errorMessage?: never;
};

export type GridCell = GridCellWithError | GridCellWithoutError;

export type GridCol = {
  title: string;
  instructions: string;
  type: ColumnType;
  options?: Option[];
  cells: GridCell[];
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
    response: result.value as TextResponse,
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

const optionString = (option:Option) => `-  ${option.title}: ${option.description}`;
const buildHydrationPrompt = (cell: GridCell):OpenAI.Chat.Completions.ChatCompletionMessageParam => {
  const hasOptions = cell.options && cell.options.length > 0
  const options = hasOptions ? `User-provided options:\n${cell?.options?.map(optionString).join("\n")}` : 'No options provided'
  let cellTypeFormatInstructions: string;
  switch (cell.columnType) {
    case 'single-select':
      cellTypeFormatInstructions = hasOptions
      ? 'Single select: Select a single option from the user-provided options below. Your selection should satisfy the provided cell data description. '
      : 'Single select. The user provided no options to choose from, so you must define your own. Define an option that is not overly specific but satisfies the cell data descripton for this cell. Your selection will be used to group cells thematically';
      
      break;
    case 'multi-select':
      cellTypeFormatInstructions = hasOptions
      ? 'Multi select: Select one or more options from the user-provided options below. Your selection should satisfy the provided cell data description.'
      : 'Multi select. The user provided no options to choose from, so you must define your own. Define one or more options that are not overly specific but satisfy the cell data descripton for this cell. Your selection will be used to group cells thematically'
      break;
    case 'single-select-user':
      cellTypeFormatInstructions = 'Select a user: Select a user and reply only with their handle';
      break;
    case 'multi-select-user':
      cellTypeFormatInstructions = 'Select users: Select multiple users and reply only with their handles';
      break;
    default:
      cellTypeFormatInstructions = 'Text: reply with a markdown string containing the answer. Avoid using markdown headings.';
      break;
  }

  return {
    role: "user",
    content: `Context: ${JSON.stringify(cell.context)}
    - Cell format instructions: ${cellTypeFormatInstructions}
    - Cell data description (use this to determine relevant data for the cell): ${cell.columnTitle}
    ${cell.columnInstructions ? `- Additional instructions: ${cell.columnInstructions}` : ``}
    ${options}`,
  }
}

export async function hydrateCell(cell: GridCell): Promise<HydrateResponse> {
  const SYSTEM = `\
  You have access to a number of tools that allow you to retrieve context from GitHub.com.\
  You may use multiple tools in sequence or parallel. 
  Your responsess will be used to populate a data grid. You should avoid asking clarifying questions, or being overly conversational.\
  You will receive a user message that contains two things:\n
  1) Context: A JSON object representing some artifact from GitHub.com. It could be an issue, pull request, commit, file, etc
  2) Instructions: A user-provided set of instructions that describe how you should populate a cell value based on the context provided. \n
  In some cases, the context object will contain the answer. In other cases, you will need to use tools to find the answer.\
  The user interface is not a chat interface, so you should avoid introductions, goodbyes, or any other pleasantries.\
  You must provide the answer to the user's question as concisely as possible.

  Cells will have different format instructions based on the expected data type of the column. It's critical that you adhere to the format instructions.\
  `;

  async function hydrate(): Promise<GridCell> {
    let hydrationSources: string[] = [];
    const prompt = buildHydrationPrompt(cell)

    let context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM },
      prompt
    ];
    let response_format = getResponseFormat(cell);
    async function run() {
      const response = await openai.chat.completions.create({
        model: MODEL,
        stream: false,
        messages: context,
        tools,
        tool_choice: "auto",
        response_format,
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
      };
    }

    if (cell.columnType === "single-select") {
      return {
        ...cell,
        prompt: prompt.content as string,
        columnType: 'single-select',
        response: JSON.parse(responseContent) as SingleSelectResponse,
        state: "done",
        hydrationSources,
        errorMessage: undefined,
      };
    } else if (cell.columnType === "multi-select") {
      return {
        ...cell,
        prompt: prompt.content as string,
        columnType: 'multi-select',
        response: JSON.parse(responseContent) as MultiSelectResponse,
        state: "done",
        hydrationSources,
        errorMessage: undefined,
      };
    } else if (cell.columnType === "multi-select-user") {
      return {
        ...cell,
        prompt: prompt.content as string,
        columnType: 'multi-select-user',
        response: JSON.parse(responseContent) as MultiSelectUserResponse,
        state: "done",
        hydrationSources,
        errorMessage: undefined,
      };
    } else if (cell.columnType === "single-select-user") {
      return {
        ...cell,
        prompt: prompt.content as string,
        columnType: 'single-select-user',
        response: JSON.parse(responseContent) as SingleSelectUserResponse,
        state: "done",
        hydrationSources,
        errorMessage: undefined,
      };
    } else {
      return {
        ...cell,
        prompt: prompt.content as string,
        columnType: 'text',
        response: responseContent as TextResponse,
        state: "done",
        hydrationSources,
        errorMessage: undefined,
      };
    }
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
