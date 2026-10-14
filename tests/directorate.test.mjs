import test from 'node:test'
import assert from 'node:assert/strict'
import { directorateAreas, directorateSchema, directorateSections } from '../src/features/recruitment/directorate.ts'

function validApplication() {
  return { answers: {
    fullName: 'Candidata de Teste',
    nickname: 'TesteAzure',
    email: 'teste@example.com',
    phone: '(41) 99999-9999',
    motivation: 'Quero ajudar na organização e contribuir com minha experiência em eventos.',
    area: 'Eventos',
    areaDescription: 'A área planeja e organiza eventos da Azure.',
  } }
}

test('diretoria aceita as cinco áreas e não exige campos do competitivo', () => {
  assert.deepEqual(directorateAreas, ['Modalidades', 'Eventos', 'Marketing', 'Administrativo', 'Produtos'])
  for (const area of directorateAreas) {
    const values = validApplication()
    values.answers.area = area
    assert.equal(directorateSchema().safeParse(values).success, true)
  }
})

test('todos os sete campos são obrigatórios e rejeitam respostas em branco', () => {
  const questions = directorateSections.flatMap((section) => section.questions)
  assert.equal(questions.length, 7)
  for (const question of questions) {
    for (const empty of [undefined, '', '   ']) {
      const values = validApplication()
      values.answers[question.id] = empty
      const result = directorateSchema().safeParse(values)
      assert.equal(result.success, false, question.label)
      assert.equal(result.error.issues[0].path.join('.'), `answers.${question.id}`)
    }
  }
})

test('validação por etapa permite preencher o contato antes das perguntas de interesse', () => {
  const values = validApplication()
  delete values.answers.motivation
  delete values.answers.area
  delete values.answers.areaDescription
  assert.equal(directorateSchema('contact').safeParse(values).success, true)
  assert.equal(directorateSchema('interest').safeParse(values).success, false)
  assert.equal(directorateSchema().safeParse(values).success, false)
})

test('e-mail e celular com DDD são validados', () => {
  for (const email of ['teste', 'teste@', 'teste@example', 'teste example@com.br']) {
    const values = validApplication()
    values.answers.email = email
    assert.equal(directorateSchema().safeParse(values).success, false)
  }
  for (const phone of ['99999-9999', 'abc41999999999', '00000000000']) {
    const values = validApplication()
    values.answers.phone = phone
    assert.equal(directorateSchema().safeParse(values).success, false)
  }
  const values = validApplication()
  values.answers.email = '  teste+azure@example.com  '
  values.answers.phone = '+55 41 99999-9999'
  assert.equal(directorateSchema().parse(values).answers.email, 'teste+azure@example.com')
})

test('área aceita uma única opção cadastrada', () => {
  for (const area of ['Outra', 'Player', ['Eventos', 'Marketing']]) {
    const values = validApplication()
    values.answers.area = area
    assert.equal(directorateSchema().safeParse(values).success, false)
  }
})

test('dados competitivos e campos alheios não entram na revisão de diretoria', () => {
  const values = { ...validApplication(), game: 'valorant', role: 'Player', acknowledged: true }
  values.answers.igl = 'Sim'
  values.answers.mainAgent = 'Sova'
  const result = directorateSchema().parse(values)
  assert.deepEqual(Object.keys(result), ['answers'])
  assert.equal('igl' in result.answers, false)
  assert.equal('mainAgent' in result.answers, false)
  assert.equal(Object.keys(result.answers).length, 7)
})
