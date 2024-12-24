export const fetchDiscussions = jest.fn().mockResolvedValue({
  repository: {
    discussions: {
      nodes: [],
      pageInfo: {
        hasNextPage: false,
        endCursor: null,
      },
    },
  },
});

export const fetchDiscussion = jest.fn().mockResolvedValue({
  repository: {
    discussion: {
      id: 'mock-id',
      title: 'Mock Discussion',
      body: 'Mock body',
    },
  },
});
