import { githubApiRequest } from '@/app/utils/github';
import { Endpoints } from '@octokit/types';
import OpenAI from 'openai';
const ENDPOINT = 'GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews';

const meta: OpenAI.FunctionDefinition = {
  name: 'listPullRequestReviews',
  description: `Retrieves a list of reviews for a given pull request.`,
  parameters: {
    type: 'object',
    properties: {
      repository: {
        type: 'string',
        description:
          'Required. The owner and name of a repository represented as :owner/:name. Do not guess. Confirm with the user if you are unsure.',
      },
      pullNumber: {
        type: 'string',
        description: 'The number that identifies the pull request.',
      },
    },
    required: ['repository', 'pullNumber'],
  },
};

async function run(repository: string, pullNumber: string) {
  const [owner, repo] = repository.split('/');
  type ListReviewsResponse = Endpoints[typeof ENDPOINT]['response'] | undefined;
  try {
    const response = await githubApiRequest<ListReviewsResponse>(ENDPOINT, {
      owner,
      repo,
      pull_number: pullNumber,
    });
    return response?.data.map((review) => ({
      reviewer: review.user?.login,
      state: review.state,
      body: review.body,
    }));
  } catch (error) {
    console.log('Failed to fetch pull request reviews!');
    console.log(error);
    return 'An error occured when trying to fetch pull request reviews.';
  }
}

export default { run, meta };
