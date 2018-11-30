
import '../engine/engine.js';

import './keyboard.js';

import './renderer.js';

import { unpackGameState } from '../utilities/utilities.js';

Client = function Client() {

    engine = new Engine();

    keyboard = new Keyboard();

    renderer = new Renderer();

    gameObjects = [];

    deadObjects = [];

    commands = [];

    sentCommands = [];

    gameObjectId = 0;

    playerShipId = -1;

    seqNum = 0;

    mapRadius = Meteor.settings.public.mapRadius;

    playerId = 0;

    numberOfUpdates = 0;

    totalSizeOfUpdates = 0;

    smallestUpdate = 0;

    largestUpdate = 0;

    gameMode = 'START_MODE';

    playerName = "";

}

Client.prototype.init = function() {

    client.setupEventHandlers();

    client.setupStreamListeners();

    client.animationLoop();

    client.getPlayerId();

}

Client.prototype.setupEventHandlers = function() {

    document.documentElement.addEventListener("keydown", keyboard.handleKeyPressEvents, false);

}

Client.prototype.setupStreamListeners = function() {

    outputStream.on('output', function(serverUpdate) {

        updateSize = JSON.stringify(serverUpdate).length;

        numberOfUpdates++;

        totalSizeOfUpdates = totalSizeOfUpdates + updateSize;

        if (updateSize < smallestUpdate || smallestUpdate == 0) {

            smallestUpdate = updateSize;

        }

        if (updateSize > largestUpdate) {

            largestUpdate = updateSize;

        }

        // console.log("Avergae Update Size: " + Math.round(totalSizeOfUpdates / numberOfUpdates) + " Smallest Update Size: " + smallestUpdate + " Largest Update Size: " + largestUpdate);

        serverUpdate = unpackGameState(serverUpdate);

        gameObjects = engine.convertObjects(gameObjects, serverUpdate.gameState);

        var lastCommandServerProcessed;

        for (x = 0; x < serverUpdate.players.length; x++) {

            if (serverUpdate.players[x].id == client.playerId) {

                lastCommandServerProcessed = serverUpdate.players[x].lastSeqNum;

            }

        }

        for (x = 0; x < sentCommands.length; x++) {

            if (sentCommands[x].seqNum > lastCommandServerProcessed) {

                commands.push(sentCommands[x]);

            }

            else {

                // Purge the command since the server has already run it!

            }

        }

        // Check to see if player's ship is destroyed. If it is, switch the game to 'END_MODE'

        var playerIsAlive = false;        

        for (x = 0; x < gameObjects.length; x++) {

            if (gameObjects[x].Id == playerShipId) {

                playerIsAlive = true;

            }

        }

        if (playerIsAlive) {

            gameMode = 'PLAY_MODE';

        } else {

            gameMode = 'START_MODE';

        }

    });

}

Client.prototype.animationLoop = function() {

    window.requestAnimationFrame(client.animationLoop);

    engine.update();

    renderer.renderMap();

}

Client.prototype.getPlayerId = function() {

    Meteor.call('getPlayerId', (err, res) => {

        if (err) {

            alert(err);

        } else {

            this.playerId = res;

        }

    });

}

Client.prototype.requestShip = function() {

    Meteor.call('createNewPlayerShip', (err, res) => {

        if (err) {

            alert(err);

        } else {

            gameMode = 'PLAY_MODE';

            playerShipId = res;

        }

    });

}

// NOTE: I should really insert the sequence number here at not

// in the KeyBoard Event handleKeyPressEvents

Client.prototype.commandHandler = function(input) {

    commands.push(input);

    sentCommands.push(input);

    inputStream.emit('input', input);

    seqNum++;

}
