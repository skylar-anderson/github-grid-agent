# Grid agent

## Getting started

First, install dependencies
`npm install`

Next, setup appropriate values in your `.env.local` file:

```bash
# Credentials if you want to use OpenAI as your LLM
OPENAI_API_KEY=

# GitHub personal access token
GITHUB_PAT=

# Supabase credentials (only necessary when using semantic search skill)
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_PASSWORD=
ANON_PUBLIC_KEY=
SERVICE_ROLE_SECRET=
```

Alternatively, you can use GitHub models instead of OpenAI directly. Just use the following `.env.local`:

```bash
GITHUB_PAT=
GITHUB_MODELS=1
```

Note, when using GitHub Models, a 5 second timeout is added to cell hydration in order to prevent rate limit errors. 

Start your local dev server with

`npm run dev`
