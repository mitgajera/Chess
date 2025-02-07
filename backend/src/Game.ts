import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, MOVE } from "./messages";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  public board: Chess;
  private startTime: Date;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
  }

  makeMove(socket: WebSocket, move: string) {
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
        type: MOVE,
        payload: move 
      });
      
      if (socket === this.player1) {
        this.player2.send(moveMessage);
      } else {
        this.player1.send(moveMessage);
      }
    } catch (e) {
      console.log("Invalid move:", e); 
      return;
    }

    if(this.board.isGameOver()){
      const gameOverMessage = JSON.stringify({
        type: GAME_OVER,
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