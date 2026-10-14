import test from 'node:test'
import assert from 'node:assert/strict'
import { academicQuestions, finalQuestions, games, hasIglQuestion, personalQuestions, roles } from '../src/features/recruitment/config.ts'
import { activeSteps, applicationSchema, emptyValues, questionSchema, questionsFor, validateStep } from '../src/features/recruitment/form.ts'

function validApplication(gameId = 'valorant', role = 'Player') {
  const values = { ...emptyValues(), game: gameId, role, acknowledged: true }
  for (const step of activeSteps(role)) {
    for (const question of questionsFor(step, values)) {
      if (question.optional) continue
      values.answers[question.id] = question.kind === 'multiple' ? [question.options[0]]
        : question.options ? question.options[0]
        : question.kind === 'tel' ? '(41) 99999-9999'
        : question.kind === 'url' ? 'https://steamcommunity.com/id/exemplo'
        : 'Resposta de teste'
    }
  }
  return values
}

test('somente as seis modalidades visíveis podem iniciar a inscrição', () => {
  assert.equal(games.filter((game) => game.visible).length, 6)
  assert.deepEqual(games.filter((game) => !game.visible).map((game) => game.id), ['teamfight-tactics', 'wild-rift', 'rocket-league'])
  for (const game of games) assert.equal(validateStep('game', { ...emptyValues(), game: game.id }).success, game.visible)
  assert.equal(validateStep('game', emptyValues()).success, false)
})

for (const game of games.filter((game) => game.visible)) {
  for (const role of roles) test(`${game.name}: fluxo completo para ${role}`, () => {
    const values = validApplication(game.id, role)
    assert.equal(applicationSchema(values).safeParse(values).success, true)
    assert.equal(activeSteps(role).includes('details'), role === 'Player')
    assert.equal(questionsFor('details', values).length > 0, role === 'Player')
  })
}

test('cada campo obrigatório é validado e opcionais podem ficar em branco, nas nove modalidades', () => {
  for (const question of [...personalQuestions, ...academicQuestions, ...games.flatMap((game) => game.questions), ...finalQuestions('Player', 'valorant', ['Outro'])]) {
    const empty = ['multiple', 'availability'].includes(question.kind) ? [] : '   '
    assert.equal(questionSchema(question).safeParse(empty).success, !!question.optional, question.label)
  }
})

test('regras exigem confirmação e função exige uma opção válida', () => {
  assert.equal(validateStep('rules', emptyValues()).success, false)
  assert.equal(validateStep('role', { ...emptyValues(), role: 'Outro' }).success, false)
})

test('IGL é obrigatório apenas para Player, exceto TFT', () => {
  for (const role of roles) for (const game of games) {
    assert.equal(hasIglQuestion(role, game.id), role === 'Player' && game.id !== 'teamfight-tactics')
  }
  const values = validApplication()
  delete values.answers.igl
  assert.equal(validateStep('final', values).success, false)
  values.role = 'Coach'
  assert.equal(validateStep('final', values).success, true)
})

test('Outro exige complemento somente enquanto selecionado', () => {
  const values = validApplication()
  values.answers.intentions = ['Outro']
  assert.equal(validateStep('final', values).success, false)
  values.answers.otherIntention = 'Organizar campeonatos'
  assert.equal(validateStep('final', values).success, true)
  values.answers.intentions = ['Ganhar horas de extensão.']
  assert.equal('otherIntention' in applicationSchema(values).parse(values).answers, false)
})

test('revisão remove respostas de outro jogo, de Player e IGL ao trocar de função', () => {
  const values = validApplication('valorant')
  values.role = 'Manager'
  const result = applicationSchema(values).parse(values)
  assert.equal('gameId' in result.answers, false)
  assert.equal('mainAgent' in result.answers, false)
  assert.equal('igl' in result.answers, false)
  const changedGame = validApplication('ea-fc')
  changedGame.answers.mainAgent = 'Resposta antiga'
  assert.equal('mainAgent' in applicationSchema(changedGame).parse(changedGame).answers, false)
})

test('RA preserva zeros; campus e período aceitam apenas as opções configuradas', () => {
  const values = validApplication()
  values.answers.ra = '00123456'
  assert.equal(applicationSchema(values).parse(values).answers.ra, '00123456')
  for (const [field, value] of [['campus', 'Campus inexistente'], ['semester', '11'], ['semester', '0']]) {
    assert.equal(validateStep('academic', { ...values, answers: { ...values.answers, [field]: value } }).success, false)
  }
})

test('WhatsApp exige DDD; links vazios opcionais passam e protocolos inválidos não', () => {
  const phone = personalQuestions.find((question) => question.id === 'whatsapp')
  for (const value of ['(41) 99999-9999', '+55 41 99999-9999', '4133334444']) assert.equal(questionSchema(phone).safeParse(value).success, true)
  for (const value of ['99999-9999', 'telefone41999999999', '00000000000']) assert.equal(questionSchema(phone).safeParse(value).success, false)
  const cs = games.find((game) => game.id === 'counter-strike-2')
  const steam = questionSchema(cs.questions[0])
  for (const value of ['steamcommunity.com/id/exemplo', 'javascript:alert(1)', 'ftp://exemplo.com']) assert.equal(steam.safeParse(value).success, false)
  assert.equal(questionSchema(cs.questions[1]).safeParse('').success, true)
  assert.equal(questionSchema(cs.questions[1]).safeParse('invalido').success, false)
})

test('múltipla escolha e disponibilidade rejeitam opções não cadastradas', () => {
  const values = validApplication()
  values.answers.availability = ['Domingo — Tarde', 'Sábado — Noite']
  assert.equal(validateStep('final', values).success, true)
  values.answers.availability.push('Domingo — Manhã')
  assert.equal(validateStep('final', values).success, false)
  values.answers.availability = []
  values.answers.intentions = ['Outra opção inválida']
  assert.equal(validateStep('final', values).success, false)
})
