import uWS from 'uWebSockets.js'
// import { v4 as uuidv4 } from 'uuid';
import fs from 'fs'
import mime from 'mime-types'
import path from 'path'
import { fileURLToPath } from 'url'
import { processEvent } from 'wsEvents.ts'
import HeroData from './cardData/characterData/heroData/HeroData.ts'
import MinionData from './cardData/characterData/minionData/MinionData.ts'
import EffectData from './cardData/effectData/EffectData.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const staticDir = path.join(__dirname, '/public')

// const clients = new Map();

const minionIDArray = {}
for (let i = 0; i < MinionData.length; i++) {
  minionIDArray[MinionData[i].fileName.toUpperCase()] = 1000 + i
}
fs.writeFileSync(
  './server/cardData/characterData/minionData/MinionID.json',
  JSON.stringify(minionIDArray, null, 2),
  'utf8'
)
console.log('Generated minion IDs')

const effectIDArray = {}
for (let i = 0; i < EffectData.length; i++) {
  effectIDArray[EffectData[i].fileName.toUpperCase()] = 2000 + i
}
fs.writeFileSync(
  './server/cardData/effectData/EffectID.json',
  JSON.stringify(effectIDArray, null, 2),
  'utf8'
)
console.log('Generated effect IDs')

const heroIDArray = {}
for (let i = 0; i < HeroData.length; i++) {
  heroIDArray[HeroData[i].fileName.toUpperCase()] = 3000 + i
}
fs.writeFileSync(
  './server/cardData/characterData/heroData/HeroID.json',
  JSON.stringify(heroIDArray, null, 2),
  'utf8'
)
console.log('Generated hero IDs')

fs.copyFile('./server/constants.ts', './public/constants.ts', (err) => {
  if (err) {
    console.error('Error copying file:', err)
  } else {
    console.log('Copied constants to public files')
  }
})

const port = Number(process.env.PORT) || 5500
uWS
  .App()
  .any('/*', async (res, req) => {
    // serving static files via HTTP
    res.onAborted(() => {
      res.aborted = true
      console.warn('Request was aborted by the client')
    })

    const filePath = path.join(
      staticDir,
      req.getUrl() === '/' ? '/index.html' : req.getUrl()
    )
    fs.readFile(filePath, (err, data) => {
      if (res.aborted) {
        return
      }

      res.cork(() => {
        const lookupResult = mime.lookup(filePath)
        const mimeType: string =
          typeof lookupResult === 'string' ? lookupResult : 'text/plain'
        res
          .writeStatus(err ? '404 Not Found' : '200 OK')
          .writeHeader('Access-Control-Allow-Origin', '*')
          .writeHeader('Content-Type', mimeType)
          .end(err ? 'File Not Found' : data)
      })
    })
  })
  .ws('/*', {
    // websocket connections
    compression: uWS.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 10,

    open: (ws) => {
      console.log('Client connected')
    },

    close: (ws, code, message) => {
      console.log('Client disconnected with code', code)
    },

    message: async (ws, message, isBinary) => {
      const msg = Buffer.from(message).toString()
      console.log('Received message:', msg)

      let parsedMessage: any
      try {
        parsedMessage = JSON.parse(msg)
      } catch (error) {
        console.error('Invalid JSON')
        return
      }

      processEvent(ws as any, parsedMessage)
    },
  })
  .listen(port, (token) => {
    if (token) {
      console.log(`Server is running at http://localhost:${port}`)
    }
  })

// CHANNEL CODE
// may or may not be useful. above code currently manages single-client connection

// const channels = new Map();

// function joinChannel(channelName, ws) {
//     if (!channels.has(channelName)) {
//         channels.set(channelName, new Set());
//     }
//     const channel = channels.get(channelName);
//     channel.add(ws);
// }

// function leaveChannel(channelName, ws) {
//     const channel = channels.get(channelName);
//     if (channel) {
//         channel.delete(ws);
//         if (channel.size === 0) {
//             channels.delete(channelName);
//         }
//     }
// }

// function broadcastToChannel(channelName, message) {
//     const channel = channels.get(channelName);
//     if (channel) {
//         channel.forEach(ws => {
//             ws.send(message);
//         });
//     }
// }

// app.ws('/*', {
//     open: (ws) => {
//         const id = uuidv4();
//         ws.id = id;
//         clients.set(id, ws);
//         console.log(`Client connected: ${id}`);
//     },
//     close: (ws) => {
//         clients.delete(ws.id);
//         console.log(`Client disconnected: ${ws.id}`);

//         // Remove from all channels
//         channels.forEach((channel, channelName) => {
//             leaveChannel(channelName, ws);
//         });
//     },
//     message: (ws, message, isBinary) => {
//         const receivedMessage = Buffer.from(message).toString();
//         console.log(`Received message from ${ws.id}: ${receivedMessage}`);

//         // Example of handling join and leave commands
//         const parsedMessage = JSON.parse(receivedMessage);
//         const { command, channel } = parsedMessage;

//         if (command === 'join') {
//             joinChannel(channel, ws);
//             console.log(`Client ${ws.id} joined channel ${channel}`);
//         } else if (command === 'leave') {
//             leaveChannel(channel, ws);
//             console.log(`Client ${ws.id} left channel ${channel}`);
//         } else if (command === 'broadcast') {
//             const { message } = parsedMessage;
//             broadcastToChannel(channel, message);
//             console.log(`Broadcasted message to channel ${channel}: ${message}`);
//         }
//     }
// });
