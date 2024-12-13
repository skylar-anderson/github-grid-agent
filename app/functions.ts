import OpenAI from 'openai';
import listCommits from './functions/listCommits';
import listIssues from './functions/listIssues';
import listIssueComments from './functions/listIssueComments';
import semanticCodeSearch from './functions/semanticCodeSearch';
import listPullRequestsForCommit from './functions/listPullRequestsForCommit';
import retrieveDiffFromSHA from './functions/retrieveDiffFromSHA';
import retrieveDiffFromPullRequest from './functions/retrieveDiffFromPullRequest';
import searchWithBing from './functions/searchWithBing';
import readFile from './functions/readFile';
import listPullRequests from './functions/listPullRequests';
import getIssue from './functions/getIssue';
import getCommit from './functions/getCommit';
import addMemory from './functions/addMemory';
import createIssue from './functions/createIssue';
import createIssueComment from './functions/createIssueComment';
import updateIssue from './functions/updateIssue';
import listDiscussions from './functions/listDiscussions';
import getDiscussion from './functions/getDiscussion';
import createPullRequestReview from './functions/createPullRequestReview';
import analyzeImage from './functions/analyzeImage';
import { type Tool } from 'ai';

type FunctionModule = {
  meta: OpenAI.FunctionDefinition;
  run: (...args: any[]) => Promise<any>;
};

export const availableFunctions: Record<string, FunctionModule> = {
  analyzeImage,
  createPullRequestReview,
  listDiscussions,
  getDiscussion,
  createIssue,
  createIssueComment,
  updateIssue,
  addMemory,
  getIssue,
  getCommit,
  listPullRequests,
  readFile,
  searchWithBing,
  retrieveDiffFromSHA,
  retrieveDiffFromPullRequest,
  semanticCodeSearch,
  listCommits,
  listIssues,
  listIssueComments,
  listPullRequestsForCommit,
};

export type FunctionName = keyof typeof availableFunctions;

export function selectFunctions(functions: FunctionName[]): OpenAI.FunctionDefinition[] {
  const funcs = [] as OpenAI.FunctionDefinition[];
  functions.forEach((name) => {
    if (availableFunctions[name]) {
      funcs.push(availableFunctions[name].meta);
    }
  });
  return funcs;
}

export function selectTools(functions: FunctionName[]): Tool[] {
  const tools = [] as Tool[];
  functions.forEach((name) => {
    if (availableFunctions[name]) {
      tools.push({
        type: 'function',
        function: {
          ...availableFunctions[name].meta,
          parameters: availableFunctions[name].meta.parameters || {},
        },
      });
    }
  });
  return tools;
}

export async function runFunction(name: string, args: any) {
  switch (name) {
    case 'analyzeImage':
      return await analyzeImage.run(args['imageUrl']);
    case 'createPullRequestReview':
      return await createPullRequestReview.run(
        args['repository'],
        args['pullNumber'],
        args['body'],
        args['event'],
        args['comments']
      );
    case 'listDiscussions':
      return await listDiscussions.run(args['repository']);
    case 'getDiscussion':
      return await getDiscussion.run(args['repository'], args['id']);
    case 'createIssueComment':
      return await createIssueComment.run(args['repository'], args['body'], args['issueNumber']);
    case 'createIssue':
      return await createIssue.run(
        args['repository'],
        args['title'],
        args['body'],
        args['labels'],
        args['assignees']
      );
    case 'updateIssue':
      return await updateIssue.run(
        args['repository'],
        args['issueNumber'],
        args['title'],
        args['body'],
        args['labels'],
        args['assignees'],
        args['state']
      );
    case 'addMemory':
      return await addMemory.run(args['memory']);
    case 'readFile':
      return await readFile.run(args['repository'], args['path']);
    case 'getCommit':
      return await getCommit.run(args['repository'], args['ref']);
    case 'getIssue':
      return await getIssue.run(args['repository'], args['issue_number']);
    case 'searchWithBing':
      return await searchWithBing.run(args['query']);
    case 'retrieveDiffFromPullRequest':
      return await retrieveDiffFromPullRequest.run(args['repository'], args['pullRequestId']);
    case 'retrieveDiffFromSHA':
      return await retrieveDiffFromSHA.run(args['repository'], args['sha']);
    case 'listPullRequestsForCommit':
      return await listPullRequestsForCommit.run(args['repository'], args['commit_sha']);
    case 'semanticCodeSearch':
      return await semanticCodeSearch.run(args['repository'], args['query']);
    case 'listCommits':
      return await listCommits.run(
        args['repository'],
        args['path'],
        args['author'],
        args['sha'],
        args['page']
      );
    case 'listIssues':
      return await listIssues.run(
        'issue',
        args['repository'],
        args['assignee'],
        args['state'],
        args['page'],
        args['label']
      );
    case 'listPullRequests':
      return await listIssues.run(
        'pull-request',
        args['repository'],
        args['assignee'],
        args['state'],
        args['page']
      );
    case 'listIssueComments':
      return await listIssueComments.run(args['repository'], args['issue_number'], args['page']);
    default:
      throw new Error(`Unknown function: ${name}`);
  }
}
