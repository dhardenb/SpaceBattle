import './engine/engine.js';
import './renderer.js';
import './command.js';

Client = function Client() {

    engine = new Engine();

    renderer = new Renderer();

    gameObjects = [];

    deadObjects = [];

    commands = [];

    replayBuffer = [];

    gameObjectId = 0;

    playerShipId = 0;

    playerHasShip = false;

    // averageLatency = 30;

    // pingLoopDuration = 250;

    // pingSamples = [];

    // buffer = 0;

    // offset = 0;

    // loopTime = 15;

    // frame = 0;

    // gameStateBuffer = [];

}

Client.prototype.init = function() {

    client.setupEventHandlers();

    client.setupStreamListeners();

    // client.startPingLoop();

    client.animationLoop();

}

Client.prototype.setupEventHandlers = function() {

    document.documentElement.addEventListener("keydown", client.handleKeyPressEvents, false);

}

Client.prototype.setupStreamListeners = function() {

    outboundState.on('outboundState', function(gameState) {

        /*var incomingGameObjects = client.convertObjects(gameState.gameState);

        var execFrame = frame + Math.ceil((buffer - averageLatency) / loopTime); // I should really get game loop time from server

        gameStateBuffer.push({gameState: incomingGameObjects, execFrame: execFrame});

        */

        gameObjects = client.convertObjects(gameState.gameState);

    });

}

Client.prototype.startPingLoop = function () {

    setInterval(function() {

        Meteor.call('testLatency', new Date(), averageLatency, (err, res) => {

            if (err) {

                console.log(err);

            } else {

                var pingLatency = (new Date().getTime() - res.startPing.getTime()) / 2;

                pingSamples.push(pingLatency);

                if (pingSamples.length >= 30) {

                    pingSamples.splice(0, 1);

                }

                var latencyTotal = 0;

                for (var x = 0, y = pingSamples.length; x < y; x++) {

                    latencyTotal += pingSamples[x];

                }

                averageLatency = Math.ceil(latencyTotal / pingSamples.length);

                buffer = res.buffer;

                offset = res.offsent;

            }

        });

    }, this.pingLoopDuration);

}

Client.prototype.animationLoop = function() {

    window.requestAnimationFrame(client.animationLoop);

    // client.cycleGameStateBuffer();

    engine.update();

    renderer.update();

    // frame++;

}

Client.prototype.cycleGameStateBuffer = function() {

    for (var x = 0, y = gameStateBuffer.length-1; x < y; y--) {

        if (gameStateBuffer[y].execFrame == frame) {

            gameObjects = gameStateBuffer[y].gameState;

            client.cycleReplayBuffer(gameStateBuffer[y].execFrame);

            gameStateBuffer.splice(y, 1);

        }

        else if (gameStateBuffer[y].execFrame < frame) {

            gameStateBuffer.splice(y, 1);

        }

    }

}

Client.prototype.cycleReplayBuffer = function(execFrame) {

    for (var x = 0, y = replayBuffer.length-1; x < y; y--) {

        if (replayBuffer[y].frame + 8 >= frame) {

            commands.push(replayBuffer[y].command);

        }

        else {

            replayBuffer.splice(y, 1);

        }

    }

}


Client.prototype.handleKeyPressEvents = function(evt) {

    // ENTER - Start
    if(evt.keyCode==13 && playerHasShip == false) {

        evt.preventDefault();

        client.requestShip();

    }

    // SPACE_BAR - Fire
    else if(evt.keyCode == 32) {

        evt.preventDefault();

        var newCommand = new Command({command: 0, targetId: playerShipId});

        client.commandHandler(newCommand);

    }

    // LEFT_ARROW - Rotate CounterClockwise
    else if(evt.keyCode == 37 || evt.keyCode == 65) {

        evt.preventDefault();

        var newCommand = new Command({command: 1, targetId: playerShipId});

        client.commandHandler(newCommand);
    }

    // UP_ARROW - Forward Thruster
    else if(evt.keyCode==38 || evt.keyCode == 87) {

        evt.preventDefault();

        var newCommand = new Command({command: 2, targetId: playerShipId});

        client.commandHandler(newCommand);
    }

    // RIGHT_ARROW - Rotate Clockwise
    else if(evt.keyCode==39 || evt.keyCode == 68) {

        evt.preventDefault();

        var newCommand = new Command({command: 3, targetId: playerShipId});

        client.commandHandler(newCommand);
    }

    // DOWN_ARROW - Stop
    else if(evt.keyCode==40 || evt.keyCode == 83) {

        evt.preventDefault();

        var newCommand = new Command({command: 4, targetId: playerShipId});

        client.commandHandler(newCommand);
    }

    // + Zoom In
    else if(evt.keyCode==187) {

        evt.preventDefault();

        if (zoomLevel > 100) {

            zoomLevel = zoomLevel - 100;

        }

        currentScale = availablePixels / zoomLevel;

        portGroup.setAttribute('transform', 'translate('+availableWidth / 2+','+availableHeight / 2+') scale(' + currentScale + ')');
    }

    // - Zoom Out
    else if(evt.keyCode==189) {

        evt.preventDefault();

        if (zoomLevel < 1100) {

            zoomLevel = zoomLevel + 100;

        }

        currentScale = availablePixels / zoomLevel;

        portGroup.setAttribute('transform', 'translate('+availableWidth / 2+','+availableHeight / 2+') scale(' + currentScale + ')');
    }

}

Client.prototype.convertObjects = function (remoteGameObjects) {

    var convertedObjects = [];

    for (var x = 0, y = remoteGameObjects.length; x < y; x++) {

        if (remoteGameObjects[x].Type == 'Human') {

            convertedObjects.push(new Ship('Human', remoteGameObjects[x]));

        }

        else if (remoteGameObjects[x].Type == 'Alpha') {

            convertedObjects.push(new Ship('Alpha', remoteGameObjects[x]));

        }

        else if (remoteGameObjects[x].Type == 'Bravo') {

            convertedObjects.push(new Ship('Bravo', remoteGameObjects[x]));

        }

        else if (remoteGameObjects[x].Type == 'Thruster') {

            convertedObjects.push(new Thruster(null, remoteGameObjects[x]));

        }

        else if (remoteGameObjects[x].Type == 'Missile') {

            convertedObjects.push(new Missile(null, remoteGameObjects[x]));

        }

        else if (remoteGameObjects[x].Type == 'Particle') {

            convertedObjects.push(new Particle(null, remoteGameObjects[x]));

        }

  }

  return convertedObjects;

}

Client.prototype.requestShip = function() {

    Meteor.call('createNewPlayerShip', (err, res) => {

        if (err) {

            alert(err);

        } else {

            playerShipId = res;

            playerHasShip = false;

        }

    });

}

Client.prototype.commandHandler = function(newCommand) {

    commands.push(newCommand);

    // replayBuffer.push({command: newCommand, frame: frame});

    inboundCommands.emit('inboundCommands', newCommand);

}
