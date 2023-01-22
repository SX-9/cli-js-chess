#! /usr/bin/env node

import inquirer from 'inquirer';
import { Chess } from 'chess.js';
import chalk from 'chalk';
import { Engine } from 'node-uci';

const engine = new Engine('/bin/stockfish');
const chess = new Chess();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const square = '■'
const chars = {
  white: {
    pawn: '♙',
    king: '♔',
    queen: '♕',
    bishop: '♗',
    night: '♘',
    rook: '♖'
  },
  black: {
    pawn: '♟',
    king: '♚',
    queen: '♛',
    bishop: '♝',
    night: '♞',
    rook: '♜'
  }
}
let i = 0;
await engine.init();

async function main() {
  let board = chess.ascii()
    .replace(/\./g, square)
    .replace(/P/g, chars.white.pawn)
    .replace(/K/g, chars.white.king)
    .replace(/Q/g, chars.white.queen)
    .replace(/B/g, chars.white.bishop)
    .replace(/N/g, chars.white.night)
    .replace(/R/g, chars.white.rook)
    .replace(/p/g, chars.black.pawn)
    .replace(/k/g, chars.black.king)
    .replace(/q/g, chars.black.queen)
    .replace(/b/g, chars.black.bishop)
    .replace(/n/g, chars.black.night)
    .replace(/r/g, chars.black.rook)
    .replace(new RegExp(`(${chars.black.bishop})(?=[^${chars.black.bishop}]*$)`), 'b') + '  ';
  console.clear();
  console.log('====== ' + chalk.yellow('Javascript') + chalk.green('Chess') + ' ======');
  console.log(chalk.bgGrey(chalk.white('          [ Black ]          ')));
  console.log(chalk.bgGrey(chalk.white(board)));
  console.log(chalk.bgGrey(chalk.white('          [ White ]          ')));
  console.log(chalk.cyan(chess.history().slice(Math.max(chess.history().length - 10, 0))));
  console.log(chess.inCheck() ? chalk.red('You Are In Check') : '');

  const { move } = await inquirer.prompt([{
    type: 'input',
    name: 'move',
    message: 'Enter A Move (' + chess.turn() + '):',
    prefix: chalk.blue('◇'),
  }]);

  if (move.toLowerCase() === '.help') {
    console.clear();
    console.log('====== ' + chalk.yellow('Javascript') + chalk.green('Chess') + ' ======');
    console.log(chalk.cyan(`

      Commands:
      .moves (square)
      .load <fen>
      .eval <js-code>
      .bot 
      .history
      .fen
      .undo
      .exit / .q

    `));
    console.log(chalk.red('Returning To The Game In 5 Seconds'));
    await sleep(5000);

  } else if (move.toLowerCase() === '.q' || move.toLowerCase() === '.exit') {
    process.exit(0);

  } else if (move.toLowerCase() === '.history') {
    console.clear();
    console.log('====== ' + chalk.yellow('Javascript') + chalk.green('Chess') + ' ======');
    console.log(chess.history());
    console.log(chalk.red('Returning To The Game In 5 Seconds'));
    await sleep(5000);

  } else if (move.startsWith('.moves')) {
    let arg = move.slice(7);
    console.clear();
    console.log('====== ' + chalk.yellow('Javascript') + chalk.green('Chess') + ' ======');
    console.log(chess.moves({ square: arg }));
    console.log(chalk.red('Returning To The Game In 5 Seconds'));
    await sleep(5000);

  } else if (move.toLowerCase() === '.undo') {
    chess.undo();

  } else if (move.toLowerCase() === '.fen') {
    console.clear();
    console.log('====== ' + chalk.yellow('Javascript') + chalk.green('Chess') + ' ======');
    console.log(chalk.cyan(chess.fen()));
    console.log(chalk.red('Returning To The Game In 10 Seconds'));
    await sleep(10000);

  } else if (move.startsWith('.load')) {
    let arg = move.slice(6);
    try {
      chess.load(arg);
    } catch (e) {
      console.log('Invalid FEN!');
    }

  } else if (move.startsWith('.bot')) {
    await engine.position(chess.fen());
    let pos = await engine.go({ depth: 15 });
    chess.move(pos.bestmove);

  } else if (move.startsWith('.eval')) {
    let arg = move.slice(6);
    try {
      console.log(eval(arg));
    } catch (e) {
      console.log(e)
    }
    await sleep(5000);

  } else {
    try {
      chess.move(move);
    } catch (e) {
      console.log(chalk.red('Invalid Move! (.help For Help)'));
      await sleep(2000);
    }
  }

  return new Promise((resolve, reject) => resolve('done'));
}

while (!chess.isGameOver()) {
  await main();
  if (chess.isGameOver()) {
    console.log({
      checkmate: chess.isCheckmate(),
      draw: chess.isDraw(),
      stalemate: chess.isStalemate(),
      insufficientMaterial: chess.isInsufficientMaterial(),
      threefoldRepetition: chess.isThreefoldRepetition(),
    });
    await engine.stop();
    process.exit(0);
    break;
  };
}