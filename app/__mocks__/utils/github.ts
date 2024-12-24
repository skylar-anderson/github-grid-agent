export const githubClient = {
  search: {
    issuesAndPullRequests: jest.fn(),
  },
  rest: {
    issues: {
      get: jest.fn(),
    },
    pulls: {
      get: jest.fn(),
    },
    repos: {
      getCommit: jest.fn(),
    },
  },
};

export const createGitHubClient = jest.fn().mockReturnValue(githubClient);
