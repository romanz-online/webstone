import { notifyClient } from '@ws'
import { EventType, Keyword } from '@constants'

function check(condition: boolean, message: string): boolean {
  if (condition) {
    notifyClient(EventType.TryAttack, false, this.toJSON())
    console.error(message)
    return true
  }
  return false
}

function checkAttack(data: any): boolean {
  return (
    check(
      !data.attacker,
      `Could not find attacker with ID ${data.attackerID} on board`
    ) ||
    check(
      !data.target,
      `Could not find target with ID ${data.targetID} on board`
    ) ||
    check(!data.attacker.canAttack, 'Minion cannot attack') ||
    check(
      !data.target.hasKeyword(Keyword.Taunt) &&
        data.opponentBoard.some((m) => m.hasKeyword(Keyword.Taunt)),
      'Taunt is in the way'
    )
  )
}

export function handleError(data: any): boolean {
  return !checkAttack(data)
}
