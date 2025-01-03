'use client';
import { Box, Button, IconButton } from '@primer/react';
import { ToolInvocation } from 'ai';
import { Message, useChat } from 'ai/react';
import type { GridState } from '@/app/actions';
import { useGridContext, NewColumnProps } from '@/app/components/GridContext';
import { PaperAirplaneIcon } from '@primer/octicons-react';

function buildSystemMessage(grid: GridState | null) {
  const role = 'system' as const;
  if (!grid) {
    return {
      role,
      id: 'system-1',
      content: 'You are a helpful assistant',
    };
  }

  return {
    role,
    id: 'system-1',
    content: `You are a helpful assistant that helps users work with a data table. The contents of the data table are automatically populated by an AI agent with tools for interacting with the GitHub API. You have been given access to a number of tools for interacting with the table in order to better assist the user. In many cases, such as when a new column is added, a separate AI agent will be used to populate the column. You just need to make sure the user's request is clear and that the table is updated correctly. If you are unsure of the user's request, ask for clarification. I would also like you to avoid unneccessary conversation and just get to the point. 

    Only use plain text. Do not use markdown.
    
    The user is currently working with a table of titled "${grid.title}". This table contains the following columns: 
    ${grid.columns.map((c, index) => `Index: ${index} Name: ${c.title}\n`).join(', ')}

    The first column is the primary column, which is of type "${grid.primaryColumnType}". The primary column contains the following entries:
    ${grid.primaryColumn.map((entry, index) => `Index: ${index} Value: ${entry.response}\n`).join(', ')}
    `,
  };
}

function ToolCall({
  toolInvocation,
  addToolResult,
}: {
  toolInvocation: ToolInvocation;
  addToolResult: (call: { toolCallId: string; result: string }) => void;
}) {
  const toolCallId = toolInvocation.toolCallId;
  const addResult = (result: string) => addToolResult({ toolCallId, result });

  if (toolInvocation.toolName === 'askForConfirmation') {
    return (
      <div key={toolCallId}>
        {toolInvocation.args.message}
        <div>
          {'result' in toolInvocation ? (
            <b>{toolInvocation.result}</b>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mt: 1 }}>
              <Button variant="primary" size="small" onClick={() => addResult('Yes')}>
                Yes
              </Button>
              <Button size="small" onClick={() => addResult('No')}>
                Cancel
              </Button>
            </Box>
          )}
        </div>
      </div>
    );
  }

  return 'result' in toolInvocation ? (
    <div key={toolCallId}>
      Tool call {`${toolInvocation.toolName}: `}
      {toolInvocation.result}
    </div>
  ) : (
    <div key={toolCallId}>Calling {toolInvocation.toolName}...</div>
  );
}

// export function ChatMessage({ message }: { message: Message }) {
//   return (
//     <Box
//       sx={{
//         px: 3,
//         fontSize: 1,
//         color: message?.role === 'user' ? 'fg.muted' : 'fg.default',
//       }}
//     >
//       <Box>{message.content}</Box>

//       {message.toolInvocations?.map((toolInvocation: ToolInvocation) => {
//         return <ToolCall toolInvocation={toolInvocation} addToolResult={addToolResult} />;
//       })}
//     </Box>
//   );
// }

export default function GridChat() {
  const { currentGridId, gridState, addNewColumn } = useGridContext();
  const systemMessage = buildSystemMessage(gridState);
  const { messages, input, handleInputChange, handleSubmit, addToolResult, append, setMessages } =
    useChat({
      id: currentGridId || 'chat',
      maxSteps: 5,
      initialMessages: [systemMessage],
      async onToolCall({ toolCall }) {
        if (toolCall.toolName === 'addColumn') {
          const newColumn = toolCall.args as NewColumnProps;
          try {
            await addNewColumn(newColumn);
            return `Added ${newColumn.title} column successfully`;
          } catch (error) {
            return `Failed to add ${newColumn.title} column: ${error instanceof Error ? error.message : 'Unknown error'}`;
          }
        }
      },
    });

  const visibleMessages = messages?.filter((m) => m.role !== 'system');

  return (
    <Box
      sx={{
        backgroundColor: 'canvas.inset',
        width: '360px',
        fontSize: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        px: 3,
        pb: 3,
        pt: 2,
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {visibleMessages.length ? (
          <>
            {visibleMessages.map((message: Message) => (
              <Box
                key={message.id}
                sx={{
                  fontSize: 1,
                  color: message?.role === 'user' ? 'fg.muted' : 'fg.default',
                }}
              >
                <Box>
                  {message.role === 'user' ? '' : '🕵🏻‍♂️'} {message.content}
                </Box>

                {message.toolInvocations?.map((toolInvocation: ToolInvocation, index: number) => (
                  <ToolCall
                    key={index}
                    addToolResult={addToolResult}
                    toolInvocation={toolInvocation}
                  />
                ))}
              </Box>
            ))}
            <Box>
              <Button
                sx={{ mt: 2, flexGrow: 'none' }}
                variant="invisible"
                size="small"
                onClick={() => setMessages([systemMessage])}
              >
                Clear
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ fontSize: 1, color: 'fg.default', py: 2 }}>
            Hello! I&apos;m an AI assistant here to help you work with your data table. Ask me to
            add or modify columns in the prompt below.
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              <Button
                onClick={() => append({ role: 'user', content: 'Add a new column' })}
                size="small"
                sx={{ flexGrow: 0 }}
              >
                Add a new column
              </Button>
              <Button
                onClick={() => append({ role: 'user', content: 'Edit an existing column' })}
                size="small"
              >
                Edit an existing column
              </Button>
              <Button onClick={() => append({ role: 'user', content: 'Filter rows' })} size="small">
                Filter rows
              </Button>
              <Button onClick={() => append({ role: 'user', content: 'Group rows' })} size="small">
                Group rows
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      <Box
        as="form"
        onSubmit={handleSubmit}
        sx={{
          p: 1,
          px: 2,
          pr: 1,
          backgroundColor: 'canvas.default',
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
          border: '2px solid',
          borderColor: 'transparent',
          alignItems: 'center',
          borderRadius: '6px',
          boxShadow: '0 0 6px rgba(0,0,0,0.08), 0 0 3px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.45)',
          transition: 'border 0.2s ease-in-out',
          '&:focus-within': {
            border: '2px solid',
            borderColor: 'accent.emphasis',
            boxShadow: '0 0 16px rgba(0,0,200,0.08), 0 0 6px rgba(0,0,200,0.12)',
          },
        }}
      >
        <Box
          as="input"
          value={input}
          onChange={handleInputChange}
          placeholder="Enter instructions to modify the grid..."
          autoFocus
          sx={{
            flex: 1,
            border: 0,
            fontSize: 1,
            '&:focus': { border: 0, outline: 0, outlineColor: 'transparent' },
          }}
        />

        <IconButton
          variant="invisible"
          type="submit"
          aria-labelledby="Submit"
          icon={PaperAirplaneIcon}
          onClick={handleSubmit}
        />
      </Box>
    </Box>
  );
}
