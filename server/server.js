const
    app = require('express')(),
    cors = require('cors'),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    bodyParser = require('body-parser'),
    PORT = process.env.PORT || 5000,
    RoomsContainer = require('./modules/roomsContainer'),
    PlayersContainer = require('./modules/playersContainer'),
    Room = require('./modules/room'),
    Player = require('./modules/player'),
    {fromClient, toClient} = require('./utils/constants'),
    {
        subscribePlayerToSocketEvents,
        unsubscribeSocketFromEvents,
    } = require('./utils/functions');

app.use(cors());
app.use(bodyParser.json());

const
    roomsContainer = new RoomsContainer(io),
    playersContainer = new PlayersContainer();

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/create-player', function (req, res) {
    const player = new Player();
    player.status = 'offline';

    playersContainer.add(player);

    roomsContainer.emitRoomsUpdated();

    res.json({
        error: 0,
        data: {
            playerID: player.playerID
        }
    });
});


app.post('/create-room', function (req, res) {
    if (!req.body.playerID) {
        res.send({
            error: 1,
            message: "playerID is not passed"
        });
        return;
    }

    //Проверим, создан ли уже плеер
    const player = playersContainer.get(req.body.playerID);
    if (!player) {
        res.send({
            error: 1,
            message: "player is not in the playersContainer"
        });
        return;
    }

    const
        roomSettings = req.body.settings || {},
        room = new Room(io, roomSettings, player.playerID);

    roomsContainer.addRoom(room);
    roomsContainer.emitRoomsUpdated(room);

    res.json({
        error: 0,
        data: {
            roomID: room.roomID
        }
    });
});


/**
 *
 * @param {Player} player
 */
const knockToRoomHandlerCreator = player => ({roomID, password, reconnectingPlayerID}, ack = Function.prototype) => {
    const
        room = roomsContainer.getRoom(roomID),
        oldPlayer = room && reconnectingPlayerID && room.getPlayer(reconnectingPlayerID);

    if (!room) {
        ack({
            error: true,
            message: 'room is not found in roomsContainer'
        });
        return;
    }

    //On Reconnect
    if (oldPlayer && oldPlayer.status === 'offline'){
        //Отпишем новосозданного пользователя от ивентов
        unsubscribeSocketFromEvents(null, player.socket);

        // //Установим старому пользователю, который в комнате, новый сокет
        // //Подпишем сокет на нужные ивенты
        oldPlayer.setSocket(player.socket, io);
        oldPlayer.status = 'online';
        room.cancelScheduledRoomDestroy();
        room.joinSocketToRoom(player.socket)
            .then(() => {
                subscribePlayerToSocketEvents(socketEvents, oldPlayer);
                subscribePlayerToSocketEvents(room.roomEvents, oldPlayer)
            });

        ack({
            reconnect: true,
            settings: room.settings,
            shipsMap: oldPlayer.shipsMap,
            playerShotsMap: oldPlayer.playerShotsMap,
            opponentShotsMap: oldPlayer.opponentShotsMap,
            playerID: oldPlayer.playerID,
            roomID: room.roomID
        });

        roomsContainer.emitRoomsUpdated(room);

        if (room.arePlayersReady()){
            room.startGame(oldPlayer);
        }

        return;
    }

    room.addPlayer(player, password)
        .then(() => {
            ack({
                playerID: player.playerID,
                roomID: room.roomID,
                settings: room.settings
            });

            roomsContainer.emitRoomsUpdated(room);

            if (room.isReadyToShipsPlacement()) {
                room.sendToRoom(toClient.startShipsPlacement);
            }
        })
        .catch(error => ack({error}))
};

/**
 *
 * @param {Player} player
 */
const disconnectHandlerCreator = player => () => {
    if (!player || !player.socket) {
        return;
    }
    player.status = 'offline';

    unsubscribeSocketFromEvents(null, player.socket);

    if (player.roomID) {
        const room = roomsContainer.getRoom(player.roomID);
        if (room) {
            room.playerLeftHandler(player);
        }
    }

    delete player.socket;
};

const socketEvents = [
    {
        name: fromClient.knockToRoom,
        handlerCreator: knockToRoomHandlerCreator
    },
    {
        name: fromClient.disconnect,
        handlerCreator: disconnectHandlerCreator
    }
];

io.on('connection', socket => {
    socket.on(fromClient.playerInit, ({playerID}, ack = Function.prototype) => {
        const player = playersContainer.get(playerID);

        if (!player) {
            ack(false);
            return;
        }

        player.setSocket(socket, io);

        try {
            subscribePlayerToSocketEvents(socketEvents, player);
            player.status = 'online';

            ack(true);
        } catch (e) {
            ack(false);
        }
    });
});

http.listen(PORT);





















