import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { academicQuestions, personalQuestions, games, finalQuestions, intentions } from '../src/features/recruitment/config.ts'
import { directorateSections } from '../src/features/recruitment/directorate.ts'

const unique = (questions: { id: string; label: string }[]) => [...new Map(questions.map((q) => [q.id, { id: q.id, label: `${q.id} | ${q.label}` }])).values()]
const columns = {
  competitive: unique([...personalQuestions, ...academicQuestions, ...games.flatMap((game) => game.questions), ...finalQuestions('Player', 'valorant', intentions)]),
  directorate: unique(directorateSections.flatMap((section) => section.questions)),
  store: unique([
    { id: 'productId', label: 'Código do produto' }, { id: 'productName', label: 'Produto' },
    { id: 'variant', label: 'Variação' }, { id: 'size', label: 'Tamanho' }, { id: 'quantity', label: 'Quantidade' },
    { id: 'fullName', label: 'Nome' }, { id: 'email', label: 'E-mail' }, { id: 'phone', label: 'Celular com DDD' }, { id: 'notes', label: 'Observações' },
  ]),
}
mkdirSync('integrations/google-apps-script', { recursive: true })
const path = 'integrations/google-apps-script/Columns.gs'
if (existsSync(path)) {
  const source = readFileSync(path, 'utf8')
  const match = source.match(/const SHEET_COLUMNS = ([\s\S]*?);\s*(?:const |$)/)
  if (!match) throw new Error('Não foi possível ler as colunas existentes; nenhum arquivo foi alterado.')
  const previous = JSON.parse(match[1]) as typeof columns
  // Keep historical column positions and labels, including retired questions.
  for (const kind of Object.keys(columns) as (keyof typeof columns)[]) {
    const ids = new Set(previous[kind].map((column) => column.id))
    columns[kind] = [...previous[kind], ...columns[kind].filter((column) => !ids.has(column.id))]
  }
}
const competitiveSheets = Object.fromEntries(games.map((game) => [game.id, {
  tab: game.id === 'counter-strike-2' ? 'CS2' : game.name,
  enabled: game.visible,
}]))
writeFileSync(path, '// Gerado por npm run sheets:columns. Não editar manualmente.\nconst SHEET_COLUMNS = ' + JSON.stringify(columns, null, 2) + ';\n\nconst COMPETITIVE_SHEETS = ' + JSON.stringify(competitiveSheets, null, 2) + ';\n')
