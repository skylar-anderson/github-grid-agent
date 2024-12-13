# Declarative Agent UI with GitHub Grid Agent

This prototype explores a declarative method of interacting with AI agents where the user merely describes the shape of a data grid and an agent with access to tools populates cell values instantaneously. The agent respects the expected structure of each cell, so the user can easily filter, group, and search against the grid data.

Here is an example of the grid triaging all open issues in primer/react, GitHub's design system.

https://github.com/user-attachments/assets/ee7c841d-0cd7-4b68-8100-e391d877ce6c

## Getting started

Run `npm install`

Update `.env.local`:

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

Or use [GitHub Models](https://docs.github.com/en/github-models/prototyping-with-ai-models) with the following `.env.local`:

```bash
GITHUB_PAT=
GITHUB_MODELS=1
```

Note, when using GitHub Models, a 5 second timeout is added to cell hydration in order to prevent rate limit errors.

Start your local dev server: `npm run dev`
