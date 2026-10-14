import { z } from 'zod'
import { academicQuestions, finalQuestions, games, personalQuestions, roles } from './config.ts'
import type { Question } from './config.ts'

export type FormValues = {
  game: string
  acknowledged: boolean
  role: string
  answers: Record<string, string | string[]>
}
export type Step = 'game' | 'rules' | 'personal' | 'academic' | 'role' | 'details' | 'final' | 'review'
export const stepLabels: Record<Step, string> = {
  game: 'Escolha seu jogo', rules: 'Antes de começar', personal: 'Sobre você', academic: 'Sua vida acadêmica',
  role: 'Seu lugar no time', details: 'Dentro do jogo', final: 'Para fechar', review: 'Revise sua inscrição',
}

export function activeSteps(role: string): Step[] {
  return ['game', 'rules', 'personal', 'academic', 'role', ...(role === 'Player' ? ['details' as const] : []), 'final', 'review']
}

export function questionsFor(step: Step, values: FormValues): Question[] {
  if (step === 'personal') return personalQuestions
  if (step === 'academic') return academicQuestions
  if (step === 'details' && values.role === 'Player') return games.find((game) => game.id === values.game)?.questions ?? []
  if (step === 'final') return finalQuestions(values.role, values.game, Array.isArray(values.answers.intentions) ? values.answers.intentions : [])
  return []
}

export function questionSchema(question: Question): z.ZodType {
  if (question.kind === 'multiple' || question.kind === 'availability') {
    return z.array(z.string()).default([])
      .refine((value) => question.optional || value.length > 0, 'Selecione pelo menos uma opção.')
      .refine((value) => value.every((item) => question.options?.includes(item)), 'Selecione uma opção válida.')
  }
  return z.string().default('').transform((value) => value.trim())
    .refine((value) => question.optional || value.length > 0, 'Preencha este campo.')
    .refine((value) => !value || !question.options || question.options.includes(value), 'Selecione uma opção válida.')
    .refine((value) => {
      if (!value || question.kind !== 'url') return true
      try { return ['https:', 'http:'].includes(new URL(value).protocol) } catch { return false }
    }, 'Informe um link completo, começando com https:// ou http://.')
    .refine((value) => {
      if (!value || question.kind !== 'tel') return true
      if (!/^[\d\s()+-]+$/.test(value)) return false
      const digits = value.replace(/\D/g, '').replace(/^(?:55)(?=\d{10,11}$)/, '')
      return /^[1-9]\d{9,10}$/.test(digits)
    }, 'Informe um telefone válido com DDD, com 10 ou 11 dígitos (ou +55).')
}

function stepShape(step: Step, values: FormValues) {
  if (step === 'game') return { game: z.string().refine((id) => games.some((game) => game.id === id && game.visible), 'Escolha uma modalidade disponível.') }
  if (step === 'rules') return { acknowledged: z.boolean().refine(Boolean, 'Confirme que está ciente das regras para continuar.') }
  if (step === 'role') return { role: z.string().refine((role) => roles.includes(role), 'Escolha a função que deseja desempenhar.') }
  return { answers: z.object(Object.fromEntries(questionsFor(step, values).map((question) => [question.id, questionSchema(question)]))) }
}

export function validateStep(step: Step, values: FormValues) {
  return z.object(stepShape(step, values)).safeParse(values)
}

// A validação completa também remove respostas de ramos que não se aplicam mais.
export function applicationSchema(values: FormValues) {
  const questions = activeSteps(values.role).flatMap((step) => questionsFor(step, values))
  return z.object({
    game: stepShape('game', values).game!,
    acknowledged: stepShape('rules', values).acknowledged!,
    role: stepShape('role', values).role!,
    answers: z.object(Object.fromEntries(questions.map((question) => [question.id, questionSchema(question)]))),
  })
}

export function emptyValues(): FormValues {
  return { game: '', acknowledged: false, role: '', answers: { intentions: [], availability: [] } }
}
