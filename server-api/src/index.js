// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;
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
            point:'',
            id:'',
        }
    ]
}
*/

io.on('connection', (socket) => {

    socket.on('create session', (data) => {
        try {
            //data: {name:'name',playerId:'',sessionId:''}
            console.log('create session:'+JSON.stringify(data));
            let sessionId = (data.sessionId == '') ? uuidv1() : data.sessionId;

            let session = sessions.find(session => {
                return session.id == sessionId;
            });

            if (session) {
                socket.emit('server error', "Session '" + sessionId + "' has been created. Please join with this session Id.")
                return;
            }

            socket.join(sessionId)
            socket.playerName = data.name;
            socket.sessionId = sessionId
            socket.playerId = data.playerId


            session = {
                id: sessionId,
                showVotes: false,
                players: [{
                    name: data.name,
                    role: 'host',
                    point: '',
                    status: 'connected',
                    id: (data.playerId == "") ? uuidv1() : data.playerId,
                }]
            };
            sessions.push(session);
            socket.emit('session created', session)
            console.log(session);
        } catch (error) {
            console.error(error)
        }
    });

    socket.on('join session', (data) => {
        //data: {name:'name',playerId:'',sessionId:'1'}
        try {
            console.log('join session:'+JSON.stringify(data));

            let session = sessions.find((session) => {
                return session.id == data.sessionId
            });
            if (!session) {
                socket.emit('server error', "Session does not exist.");
                return;
            }
            let player = session.players.find(player => {
                return player.id == data.playerId
            })

            socket.join(data.sessionId)
            socket.playerName = data.name
            socket.playerId = data.playerId
            socket.sessionId = data.sessionId

            if (!player) {
                player = {
                    role: 'player',
                    point: '',
                    id: data.playerId,
                }
                session.players.push(player)
            }
            player.name = data.name
            player.status = 'connected'
            socket.emit('session joined', session)
            socket.broadcast.to(session.id).emit('player joined', player)
            socket.broadcast.to(session.id).emit('session updated', session)
            console.log(session);
        } catch (error) {
            console.error(error)
        }
    });

    socket.on('change role', (data) => {
        //data: {name:'name',role:'host|player|observer'}
        console.log('change role:'+JSON.stringify(data));
    });

    socket.on('vote', (data) => {
        //data: {name:'name',playerId:'',sessionId:'1', point:'2'}
        try {
            console.log('vote:'+JSON.stringify(data));
            socket.playerName = data.name;
            socket.sessionId = data.sessionId
            socket.playerId = data.playerId

            let session = sessions.find((session) => {
                return session.id == data.sessionId
            });
            if (!session) {
                socket.emit('server error', "Session does not exist.");
                return;
            }

            let player = session.players.find((player) => {
                return player.id == data.playerId
            })
            if (player) {
                player.point = data.point;
                //socket.broadcast.to(session.id).emit('player voted', player);
                io.in(session.id).emit('session updated', session)
            }
        } catch (error) {
            console.error(error)
        }
    });

    socket.on('clean votes', (data) => {
        //data: {name:'name',playerId:'',sessionId:'1'}
        try {
            console.log('clean votes:'+JSON.stringify(data));
            socket.playerName = data.name;
            socket.sessionId = data.sessionId
            socket.playerId = data.playerId

            let session = sessions.find((session) => {
                return session.id == data.sessionId
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
            io.in(session.id).emit('session updated', session)
        } catch (error) {
            console.error(error)
        }
    });

    socket.on('toggle votes', (data) => {
        //data: {name:'name',playerId:'',sessionId:'1'}
        try {
            console.log('toggle votes:'+JSON.stringify(data));
            socket.playerName = data.name;
            socket.sessionId = data.sessionId
            socket.playerId = data.playerId
            socket.join(data.sessionId)

            let session = sessions.find((session) => {
                return session.id == data.sessionId
            });
            if (!session) {
                socket.emit('server error', "Session does not exist.");
                return;
            }
            session.showVotes = !session.showVotes;
            //socket.broadcast.to(session.id).emit('votes toggled', session)
            io.in(session.id).emit('session updated', session)
        } catch (error) {
            console.error(error)
        }
    });

    socket.on('refresh session', data => {
        //data: {name:'name',playerId:'',sessionId:'1'}
        try {
            console.log('refresh session:'+JSON.stringify(data));
            socket.playerName = data.name;
            socket.sessionId = data.sessionId
            socket.playerId = data.playerId

            let session = sessions.find((session) => {
                return session.id == data.sessionId
            });
            if (!session) {
                socket.emit('server error', "Session does not exist.");
                return;
            }
            socket.emit('session updated', session);
        } catch (error) {
            console.error(error)
        }
    });

    socket.on('quit session', data => {
        //data: {name:'',playerId:'',sessionId:''}
        try {
            console.log('quit session:'+JSON.stringify(data));

            let session = sessions.find((session) => {
                return session.id == data.sessionId
            });
            socket.broadcast.to(data.sessionId).emit('player left', {
                name: data.name,
            });
            if (session) {
                session.players = session.players.filter(
                    player => player.id != data.playerId
                );
                socket.broadcast.to(session.id).emit('session updated', session)
            }
            socket.leave(data.sessionId)

        } catch (error) {
            console.error(error)
        }
    });

    socket.on('player connect',data=>{
        try {
            console.log('player connect:'+JSON.stringify(data));
            socket.playerName = data.name;
            socket.sessionId = data.sessionId
            socket.playerId = data.playerId
            socket.join(data.sessionId)

            let session = sessions.find((session) => {
                return session.id == data.sessionId
            });
            if (session) {
                let player = session.players.find((player) => {
                    return player.id == data.playerId
                })
                if(player)
                {
                    player.status='connected'
                    //socket.broadcast.to(session.id).emit('player connected',player)
                    io.in(session.id).emit('session updated', session)
                }
            }
        } catch (error) {
            console.log(error)
        }
    });

    socket.on('disconnect', () => {
        try {
            console.log(socket.playerName + " disconnected.")
            let session = sessions.find((session) => {
                return session.id == socket.sessionId
            });
            // echo globally that this client has left
            if (session) {
                // session.players = session.players.filter(
                //     player => player.name != socket.playerName
                // );
                let player = session.players.find(player => {
                    return player.id == socket.playerId
                })
                if (player) {
                    player.status = 'disconnected';
                }
                socket.broadcast.to(session.id).emit('session updated', session)
            }
            // socket.broadcast.to(socket.sessionId).emit('player disconnected', {
            //     name: socket.playerName,
            // });
        } catch (error) {
            console.error(error)
        }
    });

    socket.on('error', error => {
        console.error(error);
    })

});