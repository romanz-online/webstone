import { EventType } from '@constants'
import { engine } from '@engine'
import Event from '@event'
import { GameInstance } from '@gameInstance'
import TryAttackEvent from '@tryEvents/TryAttackEvent.ts'
import TryCancelEvent from '@tryEvents/TryCancelEvent.ts'
import TryEndTurnEvent from '@tryEvents/TryEndTurnEvent.ts'
import TryHeroPowerEvent from '@tryEvents/TryHeroPowerEvent.ts'
import TryLoadEvent from '@tryEvents/TryLoardEvent.ts'
import TryPlayCardEvent from '@tryEvents/TryPlayCard.ts'
import TryTargetEvent from '@tryEvents/TryTargetEvent.ts'
import { setSocket } from '@ws'

const gameInstance =
  new GameInstance(/* GIVE EACH GameInstance AN ID OF SOME SORT */)
console.log('Running game instance')

export const processEvent = async (ws: WebSocket, json: any): Promise<void> => {
  setSocket(ws)
  const event: Event | null = generateEvent(json)
  if (event) {
    engine.queuePlayerAction(event)
  }
}

const generateEvent = (json: any): Event | null => {
  const type: EventType = json.type
  if (!type) return null

  try {
    switch (type) {
      case EventType.TryAttack:
        return new TryAttackEvent(json.attackerID, json.targetID)
      case EventType.TryPlayCard:
        return new TryPlayCardEvent(json)
      case EventType.TryEndTurn:
        return new TryEndTurnEvent()
      case EventType.TryHeroPower:
        return new TryHeroPowerEvent()
      case EventType.TryCancel:
        return new TryCancelEvent()
      case EventType.TryLoad:
        return new TryLoadEvent()
      case EventType.TryTarget:
        return new TryTargetEvent(json.targetID)
      default:
        return null
    }
  } catch (error) {
    console.error('Error parsing JSON into Event:', error.message)
    return null
  }

  return null
}
