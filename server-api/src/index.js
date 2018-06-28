// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var uuidv1 = require('uuid/v1');

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, '../public')));



//app
var sessions = [];
/*
session: 
{
    id:1,
    showVotes:false,
    players:[
        {
            name:'name',
            role:'',
            point:''
        }
    ]
}
*/

io.on('connection', (socket) => {

    socket.on('create session', (data) => {
        //data: {name:'name',sessionId:''}
        console.log(data);
        console.log(socket.id)
        let sessionId = (data.sessionId == '') ? uuidv1() : data.sessionId;
        socket.join(sessionId)
        socket.username = data.name;
        var session = {
            id: sessionId,
            showVotes: false,
            players: [{
                name: data.name,
                role: 'host',
                point: '',
                id: socket.id,
            }]
        };
        sessions.push(session);
        socket.emit('session created', session)
        console.log(session);
    });

    socket.on('join session', (data) => {
        //data: {name:'name',sessionId:'1'}
        console.log(data);
        console.log(socket.id)
        socket.join(data.sessionId)
        socket.username = data.name
        let session = sessions.find((session) => {
            return session.id == data.sessionId
        });
        if (!session) {
            socket.emit('server error', "Session does not exist.");
            return;
        }
        let player = session.players.find(player => {
            return player.name == data.name
        })
        if (player && player.id != socket.id) {
            socket.emit('server error', "Name '" + data.name + "' is already used.");
            return;
        }
        if (!player) {
            player = {
                name: data.name,
                role: 'player',
                point: '',
                id: socket.id,
            }
            session.players.push(player)
        }
        socket.emit('session joined', session)
        socket.broadcast.to(session.id).emit('player joined', player)
        console.log(session);
    });

    socket.on('change role', (data) => {
        //data: {name:'name',role:'host|player|observer'}
        console.log(data);
    });

    socket.on('vote', (data) => {
        //data: {name:'name',sessionId:'1', point:'2'}
        console.log(data);

        let session = sessions.find((session) => {
            return session.id == data.sessionId
        });
        if (!session) {
            socket.emit('server error', "Session does not exist.");
            return;
        }
        let player = session.players.find((player) => {
            return player.name == data.name
        })
        if (player) {
            player.point = data.point;
            socket.broadcast.to(session.id).emit('player voted', player);
        }
    });

    socket.on('clean votes', (data) => {
        //data: sessionId
        console.log(data);
        let session = sessions.find((session) => {
            return session.id == data
        });
        if (!session) {
            socket.emit('server error', "Session does not exist.");
            return;
        }
        session.showVotes = false;
        session.players.forEach(player => {
            player.point = '';
        });

        io.in(session.id).emit('votes cleaned', session)
    });

    socket.on('toggle votes', (data) => {
        //data: sessionId
        console.log(data);
        let session = sessions.find((session) => {
            return session.id == data
        });
        if (!session) {
            socket.emit('server error', "Session does not exist.");
            return;
        }
        session.showVotes = !session.showVotes;
        io.in(session.id).emit('votes toggled', session)
    });
    socket.on('quit session', data => {
        io.in(data.sessionId).emit('player left', {
            name: data.name,
        });
    });

    socket.on('disconnect', () => {

        // echo globally that this client has left
        io.in(socket.sessionId).emit('player left', {
            name: socket.username,
        });

    });


});