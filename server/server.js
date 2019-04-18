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
    {fromClient, toClient} = require('./utils/constants');

app.use(cors());
app.use(bodyParser.json());

const
    roomsContainer = new RoomsContainer(),
    playersContainer = new PlayersContainer();

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/create-player', function (req, res) {
    const player = new Player();
    player.status = 'offline';

    playersContainer.add(player);

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
        room = new Room(io, roomSettings);

    roomsContainer.addRoom(room);

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
const shootHandlerCreator = player => (coords, ack) => {
    try {
        const
            room = roomsContainer.getRoom(player.roomID),
            shotResult = room.playerShoots(player, coords);

        ack(shotResult); //Ответ стреляющему

        player.sendToRoomExceptMe('opponentShoot', coords); //Ответ тому, в кого стреляют
    } catch (e) {
        ack({error: e.message}); //Ответ стреляющему
    }
};

const knockToRoomHandlerCreator = player => ({roomID, reconnectingPlayerID}, ack = Function.prototype) => {
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
        player.socket.eventNames().forEach(event => {
            player.socket.removeAllListeners(event);
        });

        // //Установим старому пользователю, который в комнате, новый сокет
        // //Подпишем сокет на нужные ивенты
        oldPlayer.setSocket(player.socket, io);
        room.joinSocketToRoom(player.socket)
            .then(() => subscribePlayerToSocketEvents(oldPlayer));

        ack({
            reconnect: true,
            settings: room.settings,
            shipsMap: oldPlayer.shipsMap,
            playerShotsMap: oldPlayer.playerShotsMap,
            opponentShotsMap: oldPlayer.opponentShotsMap,
        });

        if (room.arePlayersReady()){
            room.startGame(oldPlayer);
        }

        return;
    }

    room.addPlayer(player)
        .then(() => {
            ack({
                roomID: room.roomID,
                settings: room.settings
            });

            if (room.isReadyToShipsPlacement()) {
                room.sendToRoom(toClient.startShipsPlacement);
            }
        });

};

const disconnectHandlerCreator = player => () => {
    if (!player || !player.socket) {
        return;
    }
    player.status = 'offline';
    player.socket.eventNames().forEach(event => {
        player.socket.removeAllListeners(event);
    });

    delete player.socket;
};

const chatMessageHandlerCreator = player => message => {
    player.sendToRoom('chatMessage', {
        message,
        playerID: player.playerID
    });
};

const placementDoneHandlerCreator = player => (playerShipsData, ack = Function.prototype) => {
    playerShipsData.forEach(ship => player.addShipToMap(ship));

    if (playerShipsData.length === player.shipsMap.length) {
        player.shipsPlaced = true;
        player.sendToRoomExceptMe(toClient.opponentsShipsPlaced);
        ack(true);
    } else {
        return ack(false);
    }


    const room = roomsContainer.getRoom(player.roomID);
    if (room.arePlayersReady()){
        room.startGame(player);
    }
};

const socketEvents = [
    {
        name: fromClient.shoot,
        handlerCreator: shootHandlerCreator
    },
    {
        name: fromClient.placementDone,
        handlerCreator: placementDoneHandlerCreator
    },
    {
        name: fromClient.knockToRoom,
        handlerCreator: knockToRoomHandlerCreator
    },
    {
        name: fromClient.disconnect,
        handlerCreator: disconnectHandlerCreator
    },
    {
        name: fromClient.chatMessage,
        handlerCreator: chatMessageHandlerCreator
    }
];

const subscribePlayerToSocketEvents = player => {
    socketEvents.forEach(event => {
        player.listen(event.name, event.handlerCreator(player));
    });
};

io.on('connection', socket => {
    socket.on(fromClient.playerInit, ({playerID}, ack = Function.prototype) => {
        const player = playersContainer.get(playerID);

        if (!player) {
            ack(false);
            return;
        }

        player.setSocket(socket, io);

        try {
            subscribePlayerToSocketEvents(player);
            player.status = 'online';

            ack(true);
        } catch (e) {
            ack(false);
        }
    });
});

http.listen(PORT);





















