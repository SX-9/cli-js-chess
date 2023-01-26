// Credit To ChatGPT For Generating This

import { Chess } from 'chess.js';

function minimax(depth, game, isMaximizing) {
  if (depth === 0 || game.game_over()) {
    return -evaluateBoard(game.board());
  }

  let bestMove;
  let bestScore;
  if (isMaximizing) {
    bestScore = -Infinity;
    game.moves().forEach(move => {
      game.move(move);
      const score = minimax(depth - 1, game, false);
      game.undo();
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    });
  } else {
    bestScore = Infinity;
    game.moves().forEach(move => {
      game.move(move);
      const score = minimax(depth - 1, game, true);
      game.undo();
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    });
  }

  if (isMaximizing) {
    return [bestScore, bestMove];
  } else {
    return [bestScore, bestMove];
  }
}

function evaluateBoard(board) {
  let score = 0;

  board.forEach(row => {
    row.forEach(piece => {
      if (piece) {
        score += getPieceValue(piece);
      }
    });
  });
  return score;
}

function getPieceValue(piece) {
  if (piece.type === 'p') return 10;
  if (piece.type === 'n') return 30;
  if (piece.type === 'b') return 30;
  if (piece.type === 'r') return 50;
  if (piece.type === 'q') return 90;
  if (piece.type === 'k') return 900;
  return 0;
}

function getAIMove(fen) {
  const game = new Chess(fen);
  const [score, move] = minimax(4, game, true);
  return move;
}

export default getAIMove;

