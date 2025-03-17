import { EventType } from '@constants'

let socket: WebSocket | null = null

export const setSocket = (ws: WebSocket): void => {
  socket = ws
}

export const notifyClient = (
  event: EventType,
  success: boolean,
  data: any
): void => {
  console.log('Sending event to client:', event)
  socket?.send(
    JSON.stringify({
      signature: event,
      success: success,
      data: data,
    })
  )
}
