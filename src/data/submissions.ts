// Ative somente depois de configurar e testar Google Sheets + Cloudflare.
export const submissionSettings = {
  privacyVersion: '2026-10-14',
  competitive: { enabled: false, edition: '', processId: '' },
  directorate: { enabled: false, edition: '', processId: '' },
  store: { enabled: false },
}

export type SubmissionKind = 'competitive' | 'directorate' | 'store'
