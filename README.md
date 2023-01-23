# cli-js-chess
A Terminal Chess Game Made With Javascript

## Usage
```
npx cli-js-chess path/to/config.json

# Or Install For Offline Use

npm i -g cli-js-chess
js-chess path/to/config.json
```

## How To Play
```
sx9dev@github:/ $ js-chess

====== JavascriptChess ======
          [ Black ]          
   +------------------------+
 8 | ♜  ♞  ♝  ♛  ♚  ♝  ♞  ♜ |
 7 | ♟  ♟  ♟  ♟  ♟  ♟  ♟  ♟ |
 6 | ■  ■  ■  ■  ■  ■  ■  ■ |
 5 | ■  ■  ■  ■  ■  ■  ■  ■ |
 4 | ■  ■  ■  ■  ■  ■  ■  ■ |
 3 | ■  ■  ■  ■  ■  ■  ■  ■ |
 2 | ♙  ♙  ♙  ♙  ♙  ♙  ♙  ♙ |
 1 | ♖  ♘  ♗  ♕  ♔  ♗  ♘  ♖ |
   +------------------------+
     a  b  c  d  e  f  g  h  
          [ White ]          


◇ Enter A Move (w): _
```

To Move A Piece Just Enter The Square To Move It To.

Example: e4 // Move The Pawn From e2 To e4
Example2: Nf3 // Move The Night From g1 To f3

## Commands
```
◇ Enter A Move (w): .help_
```

### .moves (square)
Returns Moves For The Given Square.
If No Square Is Provided It Will List All Posible Moves.

Example:
```
◇ Enter A Move (w): .moves e2 

====== JavascriptChess ======
[ 'e3', 'e4' ]
Returning To The Game In 5 Seconds
```

### .load (game-fen)
Loads A Game From The Given FEN.

### .eval (js-code)
Runs Inputed Javascript Code.
Note: This Is For Testing Purposes.

### .gen
Generates A Config File.
More On This Later.

### .bot
Uses A Chess Engine (Specified In Config File) To Move For You.
By Default Is Disabled.

### .history
List Previous Moves.

### .fen
Print Game FEN.

### .undo
Undo A Move.

### .exit / .q
Exit The Game.

## Configuration

Doing `.gen` Will Generate A Config File (`cli-js-chess-config.json`) With Options You Can Change.

### bot 
Options For The `.bot` Command.

#### bot.enabled => boolean
Enable The Command Or Not.
Default: `false`

#### bot.engine => string
Path To Chess Engine Executable To Use.
Default: `/bin/stockfish`

### chars 
Change How The Board Looks.

#### chars.*color*.*piece* => string
An Emoji, Letter, Or Anything.

#### chars.square => string
Empty Square.

## Todo

- [O] Custom Chess Engine
- [X] Auto Play With Bot
- [X] Multiplayer

## Tested 

Tested OS:
- Linux (Arch)
- Android (Termux) // Bot Wont Work