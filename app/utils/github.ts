import { Octokit } from 'octokit';
import { Endpoints } from '@octokit/types';
const auth = process.env.GITHUB_PAT;
const octokit = new Octokit({ auth });
const CREATE_ISSUE_ENDPOINT = 'POST /repos/{owner}/{repo}/issues';
const CREATE_ISSUE_COMMENT_ENDPOINT = 'POST /repos/{owner}/{repo}/issues/{issue_number}/comments';
const UPDATE_ISSUE_ENDPOINT = 'PATCH /repos/{owner}/{repo}/issues/{issue_number}';
const CREATE_PULL_REQUEST_REVIEW_ENDPOINT = `POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews`;
const CREATE_GIST_ENDPOINT = 'POST /gists';

export const headers = {
  'X-GitHub-Api-Version': '2022-11-28',
};

export async function githubApiRequest<T>(endpoint: string, parameters: any): Promise<T> {
  if (!auth) {
    throw new Error('GitHub PAT Not set!');
  }
  const response = await octokit.request(endpoint, { ...parameters, headers });
  return response as T;
}

export async function searchIssues<T>(q: string, autopaginate = false, page = 1): Promise<T> {
  if (!auth) {
    throw new Error('GitHub PAT Not set!');
  }

  const allResults = [];
  const perPage = 100; // Maximum allowed by GitHub API
  let hasMorePages = true;

  while (hasMorePages) {
    const response = await octokit.rest.search.issuesAndPullRequests({
      q,
      page,
      per_page: perPage,
    });

    if (!response) {
      throw new Error('Failed to load issues and pull requests');
    }

    allResults.push(...response.data.items);

    if (!autopaginate || response.data.items.length < perPage) {
      hasMorePages = false;
    } else {
      page++;
    }
  }

  return {
    data: {
      items: allResults,
      total_count: allResults.length,
    },
  } as T;
}

export async function retrieveDiffContents(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3.diff',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch diff contents');
    }

    const diffContents = await response.text();
    return diffContents;
  } catch (error) {
    console.log('Failed to fetch diff contents!');
    console.log(error);
    throw error;
  }
}

type IssueProps = {
  repository: string;
  title: string;
  body: string;
  labels: string[];
  assignees: string[];
};

type EditIssueProps = {
  repository: string;
  title?: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
  stateReason?: string;
  state?: 'open' | 'closed';
  issueNumber: number;
};

export async function updateIssue({
  title,
  body,
  labels = [],
  assignees = [],
  stateReason,
  state,
  issueNumber,
}: Omit<EditIssueProps, 'repository'>) {
  type UpdateIssueResponse = Endpoints[typeof UPDATE_ISSUE_ENDPOINT]['response'] | undefined;
  //const [owner, repo] = repository.toLowerCase().split("/");
  // Only create issues in the skylar-anderson/openai-chat-playground repo for now
  try {
    const response = await githubApiRequest<UpdateIssueResponse>(UPDATE_ISSUE_ENDPOINT, {
      owner: 'skylar-anderson',
      repo: 'openai-chat-playground',
      title,
      body,
      assignees,
      labels,
      state_reason: stateReason,
      issue_number: issueNumber,
      state,
      headers,
    });
    if (!response?.status) {
      return new Error('Failed to update issue');
    }

    return response;
  } catch (error) {
    console.log('Failed to update issue!');
    console.log(error);
    return error;
  }
}
export type ReviewCommentType = {
  path: string;
  position?: number;
  body: string;
};

export type ReviewEvent = 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';

export type ReviewProps = {
  repository: string;
  comments: ReviewCommentType[];
  pullNumber: string;
  event: ReviewEvent;
  body: string;
};

export async function createPullRequestReview({
  event,
  body,
  pullNumber,
  comments = [],
}: Omit<ReviewProps, 'repository'>) {
  type CreatePullRequestReviewResponse =
    | Endpoints[typeof CREATE_PULL_REQUEST_REVIEW_ENDPOINT]['response']
    | undefined;
  //const [owner, repo] = repository.toLowerCase().split("/");
  // Only create issues in the skylar-anderson/openai-chat-playground repo for now
  try {
    const response = await githubApiRequest<CreatePullRequestReviewResponse>(
      CREATE_PULL_REQUEST_REVIEW_ENDPOINT,
      {
        owner: 'skylar-anderson',
        repo: 'openai-chat-playground',
        body,
        event,
        pull_number: pullNumber,
        comments,
        headers,
      }
    );
    if (!response?.status) {
      return new Error('Failed to create pull request review');
    }

    return response;
  } catch (error) {
    console.log('Failed to create pull request review!');
    console.log(error);
    return error;
  }
}

export async function createIssue({
  title,
  body,
  labels = [],
  assignees = [],
}: Omit<IssueProps, 'repository'>) {
  type CreateIssueResponse = Endpoints[typeof CREATE_ISSUE_ENDPOINT]['response'] | undefined;
  //const [owner, repo] = repository.toLowerCase().split("/");
  // Only create issues in the skylar-anderson/openai-chat-playground repo for now
  try {
    const response = await githubApiRequest<CreateIssueResponse>(CREATE_ISSUE_ENDPOINT, {
      owner: 'skylar-anderson',
      repo: 'openai-chat-playground',
      title,
      body,
      assignees,
      labels,
      headers,
    });
    if (!response?.status) {
      return new Error('Failed to create issue');
    }

    return response;
  } catch (error) {
    console.log('Failed to create issue!');
    console.log(error);
    return error;
  }
}

type IssueCommentProps = {
  repository: string;
  issueNumber: number;
  body: string;
};

export async function createIssueComment({
  issueNumber,
  body,
}: Omit<IssueCommentProps, 'repository'>) {
  type CreateIssueCommentResponse =
    | Endpoints[typeof CREATE_ISSUE_COMMENT_ENDPOINT]['response']
    | undefined;
  //const [owner, repo] = repository.toLowerCase().split("/");
  // Only create issues in the skylar-anderson/openai-chat-playground repo for now
  try {
    const response = await githubApiRequest<CreateIssueCommentResponse>(
      CREATE_ISSUE_COMMENT_ENDPOINT,
      {
        owner: 'skylar-anderson',
        repo: 'openai-chat-playground',
        issue_number: issueNumber,
        body,
        headers,
      }
    );

    if (!response?.status) {
      return new Error('Failed to create issue comment');
    }

    return response;
  } catch (error) {
    console.log('Failed to create issue comment!');
    console.log(error);
    return error;
  }
}

const GIST_ID = process.env.MEMORY_GIST_ID;
const file = 'memory.txt';
const ENDPOINT = 'GET /gists/{gist_id}';

export async function getMemory() {
  type GetGistResponse = Endpoints[typeof ENDPOINT]['response'] | undefined;
  try {
    const response = await githubApiRequest<GetGistResponse>(ENDPOINT, {
      gist_id: GIST_ID,
      headers,
    });
    if (!response?.data?.files || !response.data.files[file]) {
      return 'Error loading memory';
    }

    return response.data.files[file].content as string;
  } catch (error) {
    console.log('Failed to fetch memory!');
    console.log(error);
    return 'An error occured when trying to fetch memory.';
  }
}

export async function createGist(filename: string, content: string): Promise<string> {
  type CreateGistResponse = Endpoints[typeof CREATE_GIST_ENDPOINT]['response'] | undefined;

  try {
    const sanitizedFilename = filename.replace(/[^a-z0-9.-]/gi, '_');
    const response = await githubApiRequest<CreateGistResponse>(CREATE_GIST_ENDPOINT, {
      files: {
        [sanitizedFilename]: {
          content: content,
        },
      },
      public: false,
      description: 'Created by Grid Agent',
      headers,
    });

    if (!response?.data?.html_url) {
      throw new Error('Failed to create gist: No URL returned');
    }

    return response.data.html_url;
  } catch (error) {
    console.error('Failed to create gist:', error);
    throw new Error(`Failed to create gist: ${error as string}`);
  }
}
