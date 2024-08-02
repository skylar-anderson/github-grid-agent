# Grid agent

## Getting started

First, install dependencies
`npm install`

Next, setup appropriate values in your `.env.local` file:

```
# Credentials if you want to use OpenAI as your LLM
OPENAI_API_KEY=

# Credentials if you want to use Azure OpenAI as your LLM
AZURE_API_KEY=
AZURE_MODEL_BASE_URL=https://copilot-chat-pool1-ide-westus.openai.azure.com/openai/v1/engines/copilot-gpt-4

# From Supabase (only necessary if you are creating embeddings)
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_PASSWORD=
ANON_PUBLIC_KEY=
SERVICE_ROLE_SECRET=

# From GitHub
GITHUB_PAT=

# From Azure (only necessary if you are using Bing search)
BING_SEARCH_ENDPOINT=https://api.bing.microsoft.com/v7.0/search
BING_SEARCH_SUBSCRIPTION_KEY=
```

Start your local dev server with

`npm run dev`
