import { searchIssues } from '@/app/utils/github';
import { Endpoints } from '@octokit/types';
import OpenAI from 'openai';
type ENDPOINT = 'GET /search/issues';

const meta: OpenAI.FunctionDefinition = {
  name: 'listIssues',
  description: `Retrieves a paginated list of issues for a given repository. Do NOT use this for listing pull requests`,
  parameters: {
    type: 'object',
    properties: {
      repository: {
        type: 'string',
        description:
          'Required. The owner and name of a repository represented as :owner/:name. Do not guess. Confirm with the user if you are unsure.',
      },
      page: {
        type: 'number',
        description: 'The page of issues to return, defaults to 1',
      },
      assignee: {
        type: 'string',
        description:
          "The log in of a user to filter issues by, e.g. mamuso. Pass in 'none' for issues with no assignee and * for issues assigned to any user. If no assignee is provided, it will default to *.",
      },
      label: {
        type: 'string',
        description:
          "A label name to filter issues by. Pass in 'none' for issues with no labels. If no label is provided, it will default to *.",
      },
      state: {
        type: 'string',
        enum: ['open', 'closed', 'all'],
        description:
          'The state of the issues to return, e.g. open or closed. Defaults to open. Must be one of open, closed, or all.',
      },
    },
    required: ['repository'],
  },
};

type State = 'open' | 'closed' | 'all' | undefined;
type ListIssuesResponse = Endpoints[ENDPOINT]['response'];

async function run(
  is: 'issue' | 'pull-request' = 'issue',
  repository: string,
  assignee: string,
  state: State = 'open',
  page?: number,
  label?: string
) {
  const [owner, repo] = repository.split('/');
  try {
    const filters = [`is:${is}`, `repo:${owner}/${repo}`];
    if (state !== 'all') {
      filters.push(`state:${state}`);
    }
    if (assignee) {
      filters.push(`assignee:${assignee}`);
    }
    if (label) {
      filters.push(`label:${label}`);
    }

    const issues = await searchIssues<ListIssuesResponse>(
      filters.join(' '),
      page ? false : true,
      page ? page : undefined
    );

    return issues.data.items.map((data) => ({
      assignee_handle: data.assignee?.login,
      assignee_avatar: data.assignee?.avatar_url,
      assignee_url: data.assignee?.html_url,
      assignee_name: data.assignee?.name,
      opener_handle: data.user?.login,
      state: data.state,
      title: data.title,
      body: data.body,
      number: data.number,
      url: data.html_url,
      type: is,
      value: `${data.title} (#${data.number})`,
    }));
  } catch {
    return 'An error occured when trying to fetch issues.';
  }
}

const listIssues = { run, meta };
export default listIssues;
