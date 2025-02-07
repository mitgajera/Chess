"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
    }
    makeMove(socket, move) {
        //validation for type of move using zod
        if (this.board.turn() === 'w' && socket === this.player2) {
            console.log("Invalid move: Not white's turn");
            return;
        }
        if (this.board.turn() === 'b' && socket === this.player1) {
            console.log("Invalid move: Not black's turn");
            return;
        }
        try {
            this.board.move(move);
            // Send move to the opponent immediately after successful move
            const moveMessage = JSON.stringify({
                type: messages_1.MOVE,
                payload: move
            });
            if (socket === this.player1) {
                this.player2.send(moveMessage);
            }
            else {
                this.player1.send(moveMessage);
            }
        }
        catch (e) {
            console.log("Invalid move:", e);
            return;
        }
        if (this.board.isGameOver()) {
            const gameOverMessage = JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            });
            this.player1.send(gameOverMessage);
            this.player2.send(gameOverMessage);
            return;
        }
    }
}
exports.Game = Game;
