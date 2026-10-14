import { z } from 'zod'
import type { Question } from './config.ts'
import { questionSchema } from './form.ts'

export const directorateAreas = ['Modalidades', 'Eventos', 'Marketing', 'Administrativo', 'Produtos']

export const directorateSections: { id: string; title: string; questions: Question[] }[] = [
  {
    id: 'contact',
    title: 'Sobre você',
    questions: [
      { id: 'fullName', label: 'Nome', autoComplete: 'name' },
      { id: 'nickname', label: 'Nick', autoComplete: 'nickname' },
      { id: 'email', label: 'E-mail', kind: 'email', autoComplete: 'email' },
      { id: 'phone', label: 'Número de celular com DDD', kind: 'tel', autoComplete: 'tel', hint: 'Ex.: (41) 99999-9999' },
    ],
  },
  {
    id: 'interest',
    title: 'Seu lugar na diretoria',
    questions: [
      {
        id: 'motivation',
        label: 'Por que você quer fazer parte da Diretoria da Azure Bears? E como você somaria para a Diretoria?',
        kind: 'textarea',
      },
      { id: 'area', label: 'Qual área você teria interesse de ingressar?', kind: 'select', options: directorateAreas },
      { id: 'areaDescription', label: 'Tente explicar com as suas palavras o que a área de seu interesse faz.', kind: 'textarea' },
    ],
  },
]

export function directorateSchema(sectionId?: string) {
  const questions = directorateSections
    .filter((section) => sectionId === undefined || section.id === sectionId)
    .flatMap((section) => section.questions)
  return z.object({
    answers: z.object(Object.fromEntries(questions.map((question) => [question.id, questionSchema(question)]))),
  })
}
