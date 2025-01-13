"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const messages_1 = require("./messages");
const Game_1 = require("./Game");
class GameManager {
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }
    addUser(socket) {
        this.users.push(socket);
        this.addHandler(socket);
    }
    removeUser(socket) {
        this.users = this.users.filter(user => user !== socket);
    }
    addHandler(socket) {
        socket.on("message", (data) => {
            var _a;
            const message = JSON.parse(data.toString());
            if (message.type === messages_1.INIT_GAME) {
                if (this.pendingUser) {
                    const secondPlayerColor = ((_a = message.payload) === null || _a === void 0 ? void 0 : _a.color) || 'black';
                    const firstPlayerColor = secondPlayerColor === 'black' ? 'white' : 'black';
                    const game = new Game_1.Game(firstPlayerColor === 'white' ? this.pendingUser : socket, firstPlayerColor === 'black' ? this.pendingUser : socket);
                    this.pendingUser.send(JSON.stringify({
                        type: 'INIT_GAME',
                        color: firstPlayerColor
                    }));
                    socket.send(JSON.stringify({
                        type: 'INIT_GAME',
                        color: secondPlayerColor
                    }));
                    this.games.push(game);
                    this.pendingUser = null;
                }
                else {
                    this.pendingUser = socket;
                }
            }
            if (message.type === messages_1.MOVE) {
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    game.makeMove(socket, message.move);
                }
            }
        });
    }
}
exports.GameManager = GameManager;
