import { EventType } from './constants.ts'

let ws: WebSocket | null = null

const eventHandlers: any = {}

const getEventTypeName = (event: EventType): string => {
  return (
    Object.keys(EventType)[Object.values(EventType).indexOf(event)] ||
    `Unknown(${event})`
  )
}

export const wsEventHandler = ({
  socket,
  event,
  onSuccess,
  onFailure = () => {},
}: {
  socket: WebSocket
  event: EventType
  onSuccess: (data: any) => void
  onFailure?: (data: any) => void
}): void => {
  if (!eventHandlers[event]) {
    eventHandlers[event] = []
  }

  eventHandlers[event].push({ onSuccess, onFailure })

  socket.addEventListener('message', (evt: any): void => {
    const { eventType, success, data } = JSON.parse(evt.data)

    // not the right instance of wsEventHandler for this signature
    if (event != eventType) return

    // no handlers specified for the signature
    if (!eventHandlers[eventType]) return

    eventHandlers[eventType].forEach((handler: any) => {
      console.log(success ? 'SUCCESS' : 'FAIL', getEventTypeName(eventType))

      if (success) {
        handler.onSuccess(data)
      } else {
        handler.onFailure(data)
      }
    })
  })
}

export const setWebSocket = (socket: WebSocket): void => {
  ws = socket
}

export const triggerWsEvent = (event: EventType, data: any = {}): void => {
  if (ws) {
    ws.send(JSON.stringify({ event: event, data: data }))
  } else {
    console.error('! WebSocket not defined')
  }
}
