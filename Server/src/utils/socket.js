    import { Server } from 'socket.io';
    import { createServer } from 'http'
    import express from 'express'

    const app = express()
    const server = createServer(app);
    // console.log('hello')
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
        }
    })

    export function getReceiverSocketId(userId){
        return userSocketmap[userId]
    }

    // used to store online users
    // it will store like {userId: socketId}
    const userSocketmap = {}

    io.on('connection', (socket) => {
        console.log("A User Connected", socket.id)  

        const userId = socket.handshake.query.userId;
        if(userId){
            userSocketmap[userId] = socket.id
        }

        //It is used to send events to all the connected clients
        io.emit('getOnlineUsers', Object.keys(userSocketmap));

        socket.on('error', (err) => {
            console.error('Socket Error:', err);
        });


        socket.on('disconnect', () =>{
            console.log("A User Disconnected", socket.id)
            delete userSocketmap[userId]
            io.emit('getOnlineUsers', Object.keys(userSocketmap));
        })
    })
    export { io, app, server }