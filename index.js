#! /usr/bin/env node

import cors from 'cors';
import chalk from 'chalk';
import express from 'express';
import inquirer from 'inquirer';
import { dirname } from 'path';
import { Chess } from 'chess.js';
import { Engine } from 'node-uci';
import { fileURLToPath } from 'url';
import { appendFile, readFileSync, writeFileSync } from 'fs';
import { StringDecoder } from 'string_decoder';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const chess = new Chess();
const config = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], { encoding: 'UTF-8' })) : {
  "server": {
    "port": 8075,
    "pass": {
      "white": "white",
      "black": "black"
    }
  },
  "bot": {  
    "enabled": false,
    "engine": "/bin/stockfish"
  },
  "chars": {
    "white": {
      "pawn": "♙",
      "king": "♔",
      "queen": "♕",
      "bishop": "♗",
      "night": "♘",
      "rook": "♖"
    },
    "black": {
      "pawn": "♟",
      "king": "♚",
      "queen": "♛",
      "bishop": "♝",
      "night": "♞",
      "rook": "♜"
    },
    "square": "■"
  }
};
const { chars, bot, server } = config;
const engine = new Engine(bot.engine);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let i = 0;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.get('/', (req, res) => res.sendFile(__dirname + '/gui.html'));
app.get('/api', (req, res) => res.json({
  fen: chess.fen(),
  moves: chess.moves(),
  history: chess.history(),
  side: chess.turn(),
  checked: chess.isCheck(),
}));

function lostBy() {
  let out = {
    exit: 0
  };
  if (chess.isCheckmate()) out.mess = chalk.green('Checkmate By ' + ( chess.turn() === 'w' ? 'White' : 'Black' ))
  if (chess.isDraw()) {
    out.exit = 1;
    if (chess.isStalemate()) out.mess = 'Draw By Stalemate';
    if (chess.isInsufficientMaterial()) out.mess = 'Draw By Insufficient Material';
    if (chess.isThreefoldRepetition()) out.mess = 'Draw By Threefold Repetition';
  };
  return out;
}

async function main() {
  let board = chess.ascii()
    .replace(/\./g, chars.square)
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
      .load <game-fen>
      .eval <js-code>
      .history
      .serve
      .undo
      .gen
      .bot
      .fen
      .exit / .q

    `));
    console.log(chalk.red('Returning To The Game In 5 Seconds'));
    await sleep(5000);

  } else if (move.toLowerCase() === '.q' || move.toLowerCase() === '.exit') {
    console.log(chalk.red('FEN:'), chalk.cyan(chess.fen()));
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
    if (bot.enabled) {
      await engine.position(chess.fen());
      let pos = await engine.go({ depth: 15 });
      chess.move(pos.bestmove);
    } else {
      console.log(chalk.red('Bot Is Disabled'));
      await sleep(2000);
    }

  } else if (move.startsWith('.eval')) {
    let arg = move.slice(6);
    try {
      console.log(eval(arg));
    } catch (e) {
      console.log(e)
    }
    await sleep(5000);

  } else if (move.toLowerCase() === '.refresh') {
    await sleep(500);

  } else if (move.toLowerCase() === '.gen') {
    writeFileSync('cli-js-chess-config.json', JSON.stringify(config, null, 2));
    console.log(chalk.cyan('Config File Generated, To Use It Rerun Javascript Chess With The File Path As The Second Argument!'));
    await sleep(5000);

  } else if (move.toLowerCase() === '.serve') {
    app.listen(server.port, () => console.log(chalk.green('Server Running On Port'), server.port));
    await sleep(2000);

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

async function start() {
  if (bot.enabled) await engine.init();
  while (!chess.isGameOver()) {
    await main();
    if (chess.isGameOver()) {
      console.log(lostBy().mess);
      console.log(chalk.red('FEN:'), chalk.cyan(chess.fen()));
      process.exit(lostBy().exit);
    }
  }
}

start();
