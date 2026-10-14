import { handleSubmissions, type SubmissionEnv } from '../../server/submissions.ts'

export const onRequest = (context: { request: Request; env: SubmissionEnv }) =>
  handleSubmissions(context.request, context.env)
