'use client';
import { Box } from '@primer/react';
import { ToolInvocation } from 'ai';
import { Message, useChat } from 'ai/react';
import type { GridState } from '@/app/actions';
import { useGridContext, NewColumnProps } from '@/app/components/GridContext';

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
    
    The user is currently working with a table of titled "${grid.title}". This table contains the following columns: 
    ${grid.columns.map((c, index) => `Index: ${index} Name: ${c.title}\n`).join(', ')}

    The first column is the primary column, which is of type "${grid.primaryColumnType}". The primary column contains the following entries:
    ${grid.primaryColumn.map((entry, index) => `Index: ${index} Value: ${entry.response}\n`).join(', ')}
    `,
  };
}

export function ChatMessage({ message }: { message: Message }) {
  const { addToolResult } = useChat({});

  return (
    <Box
      sx={{
        px: 3,
        fontSize: 1,
        color: message?.role === 'user' ? 'fg.muted' : 'fg.default',
      }}
    >
      <Box>{message.content}</Box>

      {message.toolInvocations?.map((toolInvocation: ToolInvocation) => {
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
                  <>
                    <button onClick={() => addResult('Yes')}>Yes</button>
                    <button onClick={() => addResult('No')}>No</button>
                  </>
                )}
              </div>
            </div>
          );
        }

        // other tools:
        return 'result' in toolInvocation ? (
          <div key={toolCallId}>
            Tool call {`${toolInvocation.toolName}: `}
            {toolInvocation.result}
          </div>
        ) : (
          <div key={toolCallId}>Calling {toolInvocation.toolName}...</div>
        );
      })}
    </Box>
  );
}

export default function GridChat() {
  const { gridState, addNewColumn } = useGridContext();
  const { messages, input, handleInputChange, handleSubmit, addToolResult } = useChat({
    maxSteps: 5,
    initialMessages: [buildSystemMessage(gridState)],

    // run client-side tools that are automatically executed:
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

  return (
    <Box
      sx={{
        backgroundColor: 'canvas.default',
        flex: 1,
        display: 'flex',
        height: '100%',
        maxWidth: '360px',
        borderLeft: '1px solid',
        borderColor: 'border.default',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{ flex: 1, overflow: 'auto', pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {messages
          ?.filter((m) => m.role !== 'system')
          .map((message: Message) => (
            <Box
              key={message.id}
              sx={{
                px: 3,
                fontSize: 1,
                color: message?.role === 'user' ? 'fg.muted' : 'fg.default',
              }}
            >
              <Box>{message.content}</Box>

              {message.toolInvocations?.map((toolInvocation: ToolInvocation) => {
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
                          <>
                            <button onClick={() => addResult('Yes')}>Yes</button>
                            <button onClick={() => addResult('No')}>No</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                }

                // other tools:
                return 'result' in toolInvocation ? (
                  <div key={toolCallId}>
                    Tool call {`${toolInvocation.toolName}: `}
                    {toolInvocation.result}
                  </div>
                ) : (
                  <div key={toolCallId}>Calling {toolInvocation.toolName}...</div>
                );
              })}
            </Box>
          ))}
      </Box>

      <Box as="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
        <Box
          as="input"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question..."
          sx={{
            width: '100%',
            borderRadius: 2,
            borderColor: 'border.default',
            border: '1px solid',
            color: 'fg.deault',
            p: 2,
          }}
        />
      </Box>
    </Box>
  );
}
