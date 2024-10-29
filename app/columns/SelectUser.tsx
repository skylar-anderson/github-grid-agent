import React from "react";
import OpenAI from "openai";
import { BaseColumnType } from "./BaseColumnType";
import { GridCell, ColumnResponse } from "../actions";
import { Label, Box, Avatar } from "@primer/react";

function selectUserSchema(
  multiple: boolean,
): OpenAI.ChatCompletionCreateParams["response_format"] {
  return {
    type: "json_schema",
    json_schema: {
      name: "select_user_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          [multiple ? "users" : "user"]: multiple
            ? {
                type: "array",
                description:
                  "The handles of the users that you have selected. If there are no clear users to select, use an empty array",
                items: {
                  type: "string",
                },
              }
            : {
                type: "string",
                description:
                  'The handle of the user that you have selected. If there is no clear user to select, use the string "no-user"',
              },
        },
        required: [multiple ? "users" : "user"],
        additionalProperties: false,
      },
    },
  };
}

const avatarUrl = (handle: string, size: number = 200) =>
  `https://github.com/${handle}.png?size=${size}`;

function User({ handle }: { handle: string }) {
  return (
    <Label sx={{ display: "flex", alignItems: "center", border:0, backgroundColor:'canvas.inset', pl: 0, gap: 1 }}>
      <Avatar src={avatarUrl(handle)} size={16} />
      <Box sx={{ fontWeight: "semibold", color: "fg.default" }}>{handle}</Box>
    </Label>
  );
}

export const SelectUserColumnType: BaseColumnType<"select-user"> = {
  type: "select-user",
  renderCell: (cell: GridCell<"select-user">) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {"users" in cell.response ? (
        cell.response.users.length > 0 ? (
          cell.response.users.map((handle: string, index: number) => (
            <User handle={handle} key={index} />
          ))
        ) : (
          <Box sx={{ color: "fg.default", fontSize: 1 }}>No users selected</Box>
        )
      ) : cell.response.user === "no-user" ? (
        <Box sx={{ color: "fg.default", fontSize: 1 }}>No user selected</Box>
      ) : (
        <User handle={cell.response.user} />
      )}
    </Box>
  ),
  generateResponseSchema: (_, multiple?: boolean) =>
    selectUserSchema(multiple || false),
  buildHydrationPrompt: (cell: GridCell<"select-user">) =>
    `Select ${cell.multiple ? "users" : "a user"}: Select ${cell.multiple ? "multiple users" : "a user"} and reply only with their handle${cell.multiple ? "s" : ""}`,
  parseResponse: (
    responseContent: string,
    multiple?: boolean,
  ): ColumnResponse["select-user"] => {
    const parsed = JSON.parse(responseContent);
    return multiple ? { users: parsed.users } : { user: parsed.user };
  },
};
