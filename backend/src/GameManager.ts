import { WebSocket } from "ws";
import { Game } from "./Game"; // Ensure Game is imported
import { GAME_OVER, MOVE } from "./messages";

export class GameManager {
  public player1: WebSocket | null = null;
  public player2: WebSocket | null = null;
  public game: Game;
  private startTime: Date;

  constructor() {
    this.game = new Game(this.player1 ?? new WebSocket(""), this.player2 ?? new WebSocket("")); // Ensure Game is constructed with valid WebSocket instances
    this.startTime = new Date();
  }

  addUser(socket: WebSocket) {
    if (!this.player1) {
      this.player1 = socket;
      console.log("Player 1 has joined the game.");
    } else if (!this.player2) {
      this.player2 = socket;
      console.log("Player 2 has joined the game.");
    } else {
      console.log("Game is full. Cannot add more players.");
      socket.close(); // Optionally close the socket if the game is full
    }
  }

  removeUser(socket: WebSocket) {
    if (socket === this.player1) {
      this.player1 = null;
      console.log("Player 1 has left the game.");
    } else if (socket === this.player2) {
      this.player2 = null;
      console.log("Player 2 has left the game.");
    }
  }

  getGameStatus(): { gameOver: boolean; turn: string } {
    return this.game.getStatus();
  }

  makeMove(socket: WebSocket, move: string) {
    // Ensure correct player is making the move
    if ((this.game.board.turn() === 'w' && socket !== this.player1) ||
        (this.game.board.turn() === 'b' && socket !== this.player2)) {
      console.log("Invalid move: Not your turn");
      return;
    }

    try {
      const result = this.game.board.move(move);
      if (!result) {
        console.log("Invalid move: Illegal move");
        return;
      }
      
      const moveMessage = JSON.stringify({
        type: MOVE,
        payload: move
      });
      
      const opponent = socket === this.player1 ? this.player2 : this.player1;
      opponent?.send(moveMessage);

      if (this.game.board.isGameOver()) {
        const gameOverMessage = JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.game.board.turn() === "w" ? "black" : "white"
          }
        });
        this.player1?.send(gameOverMessage);
        this.player2?.send(gameOverMessage);
      }
    } catch (e) {
      console.log("Invalid move:", e);
    }
  }
}
