const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*"
  }
})

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('start_simulation', (data) => {
    console.log('Simulation started:', data)

    let value = 0

    const interval = setInterval(() => {
      value += 10
      console.log('Sending tick:', value)

      socket.emit('tick_update', {
        "1": { value }
      })
    }, 1000)

    socket.on('disconnect', () => {
      clearInterval(interval)
      console.log('Client disconnected')
    })
  })
})

server.listen(5000, () => {
  console.log('Backend running on http://localhost:5000')
})