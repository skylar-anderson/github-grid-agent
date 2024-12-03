import React from "react";
import OpenAI from "openai";
import { BaseColumnType } from "./BaseColumnType";
import { GridCell, ColumnResponse } from "../actions";
import { Label, Box, Link } from "@primer/react";
import { IssueOpenedIcon, GitPullRequestIcon } from "@primer/octicons-react";

function issuePRSchema(
  multiple: boolean
): OpenAI.ChatCompletionCreateParams["response_format"] {
  return {
    type: "json_schema",
    json_schema: {
      name: "issue_pr_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          [multiple ? "references" : "reference"]: multiple
            ? {
                type: "array",
                description: "The issues or PRs that you have selected. If there are no clear references to select, use an empty array",
                items: {
                  type: "object",
                  properties: {
                    number: { type: "integer" },
                    repository: { type: "string" },
                    type: { type: "string", enum: ["issue", "pull-request"] },
                    title: { type: "string" },
                  },
                  required: ["number", "repository", "type"],
                  additionalProperties: false,
                },
              }
            : {
                type: "object",
                description: "The issue or PR that you have selected. If there is no clear reference to select, use null",
                properties: {
                  number: { type: "integer" },
                  repository: { type: "string" },
                  type: { type: "string", enum: ["issue", "pull-request"] },
                  title: { type: "string" },
                },
                required: ["number", "repository", "type"],
                additionalProperties: false,
              },
        },
        required: [multiple ? "references" : "reference"],
        additionalProperties: false,
      },
    },
  };
}

function IssueOrPR({ reference }: { 
  reference: { 
    number: number; 
    repository: string; 
    type: 'issue' | 'pull-request';
    title?: string;
  } 
}) {
  const url = `https://github.com/${reference.repository}/${reference.type === 'issue' ? 'issues' : 'pull'}/${reference.number}`;
  const Icon = reference.type === 'issue' ? IssueOpenedIcon : GitPullRequestIcon;
  
  return (
    <Link href={url} target="_blank" rel="noopener noreferrer">
      <Label variant={reference.type === 'issue' ? 'accent' : 'success'}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon size={14} />
          <Box>
            {reference.repository}#{reference.number}
            {reference.title && (
              <Box sx={{ color: 'fg.muted', display: 'inline' }}> - {reference.title}</Box>
            )}
          </Box>
        </Box>
      </Label>
    </Link>
  );
}

export const IssuePRColumnType: BaseColumnType<"issue-pr"> = {
  type: "issue-pr",
  renderCell: (cell: GridCell<"issue-pr">) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {"references" in cell.response && cell.response.references ? (
        cell.response.references.length > 0 ? (
          cell.response.references.map((ref, index) => (
            <IssueOrPR reference={ref} key={index} />
          ))
        ) : (
          <>No issues/PRs selected</>
        )
      ) : cell.response.reference ? (
        <IssueOrPR reference={cell.response.reference} />
      ) : (
        <>No issue/PR selected</>
      )}
    </Box>
  ),
  generateResponseSchema: (_, multiple?: boolean) =>
    issuePRSchema(multiple || false),
  buildHydrationPrompt: (cell: GridCell<"issue-pr">) =>
    `Select ${cell.multiple ? "issues/PRs" : "an issue/PR"}: Select ${
      cell.multiple ? "multiple issues or pull requests" : "an issue or pull request"
    } and reply with their number, repository, and type`,
  parseResponse: (
    responseContent: string,
    multiple?: boolean
  ): ColumnResponse["issue-pr"] => {
    const parsed = JSON.parse(responseContent);
    return multiple 
      ? { references: parsed.references } 
      : { reference: parsed.reference };
  },
}; 