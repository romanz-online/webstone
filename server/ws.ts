let socket: WebSocket | null = null

export const setSocket = (ws: WebSocket): void => {
  socket = ws
}

export const notifyClient = (
  event: string,
  success: boolean,
  data: any
): void => {
  socket?.send(
    JSON.stringify({
      signature: event,
      success: success,
      data: data,
    })
  )
}
