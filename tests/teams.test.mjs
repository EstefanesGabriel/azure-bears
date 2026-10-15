import test from 'node:test'
import assert from 'node:assert/strict'
import { teamModalities, findTeamRoute, visibleLines, visiblePlayers } from '../src/data/teams.ts'

test('as rotas de equipes respeitam visibilidade em cada nível', () => {
  const game = teamModalities.find((entry) => entry.id === 'valorant')
  const line = game.lines[0]
  const player = line.players[0]
  const initial = [game.visible, line.visible, player.visible]
  try {
    assert.equal(findTeamRoute(game.id, line.id).line, line)
    game.visible = false
    assert.equal(findTeamRoute(game.id, line.id).game, undefined)
    assert.equal(findTeamRoute(game.id, line.id).line, undefined)
    game.visible = true
    line.visible = false
    assert.equal(findTeamRoute(game.id, line.id).line, undefined)
    assert.equal(visibleLines(game).includes(line), false)
    line.visible = true
    player.visible = false
    assert.equal(visiblePlayers(line).includes(player), false)
    assert.equal(findTeamRoute('inexistente', line.id).game, undefined)
    assert.equal(findTeamRoute(game.id, 'inexistente').line, undefined)
  } finally { [game.visible, line.visible, player.visible] = initial }
})

test('IDs do cadastro não geram rotas ou perfis ambíguos', () => {
  const unique = (items) => {
    assert.equal(new Set(items.map((item) => item.id)).size, items.length)
    for (const item of items) assert.match(item.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  }
  unique(teamModalities)
  for (const game of teamModalities) {
    unique(game.lines)
    for (const line of game.lines) unique(line.players)
  }
})
