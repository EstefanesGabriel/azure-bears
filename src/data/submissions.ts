// Edição temporária para validar Google Sheets + Cloudflare com dados fictícios.
// Antes de divulgar as inscrições, substitua edition e processId pela edição oficial.
// O recebimento também depende de SUBMISSIONS_ENABLED=true no Cloudflare Pages.
export const submissionSettings = {
  privacyVersion: '2026-10-14',
  competitive: { enabled: true, edition: 'teste-integracao-2026-10', processId: 'competitivo-teste-integracao-2026-10' },
  directorate: { enabled: true, edition: 'teste-integracao-2026-10', processId: 'diretoria-teste-integracao-2026-10' },
  store: { enabled: false },
}

export type SubmissionKind = 'competitive' | 'directorate' | 'store'
