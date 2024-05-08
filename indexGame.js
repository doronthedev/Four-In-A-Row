const sound2 = new Audio('img\\sound2.mp3');

const Boxes = document.querySelectorAll('.boxes');
const UserTurnSpan = document.querySelector('.userTurn');
const UserTurnSpanP1 = document.querySelector('.userTurnP1');
const UserTurnSpanP2 = document.querySelector('.userTurnP2');
const Btns = document.querySelectorAll('.choiceBtn');
const ComputerBtn = document.querySelector('.vsComputer');
const HumanBtn = document.querySelector('.vsHuman');
const ResetBtn = document.querySelector('.reset');

let userTurn;
let isPlayH = false;
let isPlayC = false;
let wait = false;

const gameMap = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
];

setUpEventListenerH();
setUpEventListenerC();

if (window.innerWidth > 480 && window.innerHeight > 400) {
  hoverColumn();
}

ResetBtn.onclick = () => {
  resetBoard();
  resetMap(gameMap);
};

ComputerBtn.onclick = () => {
  setup(gameMap, 'hvc');
  isPlayH = false;
};

HumanBtn.onclick = () => {
  setup(gameMap, 'hvh');
  isPlayC = false;
};

function hoverColumn() {
  let column;

  Boxes.forEach((box, index) => {
    if (!checkIfCellEmpty(gameMap, index)) return;

    box.addEventListener('mouseover', () => {
      column = getColumn(index);
      for (let i = 0; i < 42; i++) {
        if (getColumn(i) === column && checkIfCellEmpty(gameMap, i))
          Boxes[i].style.backgroundColor = '#73c0ff';
      }
    });

    box.addEventListener('mouseout', () => {
      column = getColumn(index);
      for (let i = 0; i < 42; i++) {
        if (getColumn(i) === column && checkIfCellEmpty(gameMap, i))
          Boxes[i].style.backgroundColor = '';
      }
    });
  });
}

function getColumn(index) {
  return index % 7;
}

function resetMap() {
  for (let i = 0; i < gameMap.length; i++) {
    for (let j = 0; j < gameMap[i].length; j++) {
      gameMap[i][j] = 0;
    }
  }
}

function resetBoard() {
  for (let box of Boxes) {
    box.style.backgroundColor = '';
    box.style.border = '';
    box.style.opacity = '';
  }

  for (let btn of Btns) {
    btn.style.backgroundColor = '';
    btn.style.boxShadow = '';
  }

  UserTurnSpan.style.color = '';
  UserTurnSpan.textContent = 'Red';
  UserTurnSpanP1.textContent = "It's";
  UserTurnSpanP2.textContent = 'turn';

  userTurn = 'R';
  isPlayC = false;
  isPlayH = false;
}

function setCell(gameMap, val, x, y, index = undefined) {
  if (gameMap === undefined || val === undefined) return;

  if (x === undefined && y === undefined) {
    const coordinates = getCoordinates(index);
    [x, y] = [coordinates.x, coordinates.y];
  }

  if (gameMap[x][y] == 0) gameMap[x][y] = val;
}

function getCoordinates(index) {
  if (index === undefined || index < 0 || index > 42) throw new Error('get coordinates :/');

  function getX(index) {
    if (index < 7) return 0;
    if (index < 14) return 1;
    if (index < 21) return 2;
    if (index < 28) return 3;
    if (index < 35) return 4;
    if (index <= 42) return 5;
  } //TODO make more general function (index % 7)

  const x = getX(index);
  const y = index - x * 7;
  return { x, y };
}

function getIndex({ x, y }) {
  if (x < 0) throw new Error('get index: x < 0 :/');
  if (y < 0) throw new Error('get index: y < 0 :/');
  if (x > 7) throw new Error('get index: x > 7 :/');
  if (y > 7) throw new Error('get index: y > 7 :/');
  // if (x < 0 || x > 7 || y > 7 || x < 0) throw new Error('get index :/');

  const index = x * 7 + y;

  return index;
}

function checkIfCellEmpty(gameMap, index) {
  if (index < 0 || index > 42 || gameMap === undefined) throw new Error('check cell empty :/');

  const { x, y } = getCoordinates(index);

  if (gameMap[x][y] === 0) return true;
  return false;
}

function boardWinStatus(userTurn, winCells) {
  UserTurnSpanP1.textContent = '';
  UserTurnSpanP2.textContent = '';

  sound2.play();

  for (const cell of winCells) {
    Boxes[cell].style.opacity = '0.5';
  }

  if (userTurn === 'Tie') {
    UserTurnSpan.style.color = '#282038';
    UserTurnSpan.textContent = `It's a Tie`;
    return;
  }

  UserTurnSpan.style.color = userTurn === 'R' ? '' : '#154797';
  UserTurnSpan.textContent = `${userTurn === 'R' ? 'Red' : 'Blue'} won :)`;
}

function changeBoard(index, turn) {
  if (turn === undefined || index === undefined) throw new Error('change board :/');

  if (turn === 'R') {
    UserTurnSpan.textContent = 'Blue';
    UserTurnSpan.style.color = '#154797';
    Boxes[index].style.border = '5px solid #000000';
    Boxes[index].style.backgroundColor = '#d6310b';
    return;
  }

  UserTurnSpan.textContent = 'Red';
  UserTurnSpan.style.color = '';
  Boxes[index].style.border = '5px solid #000000';
  Boxes[index].style.backgroundColor = '#0e4696';
}

function setUpEventListenerH() {
  Boxes.forEach((box, indexOfBox) => {
    box.addEventListener('click', () => {
      if (isPlayH) humanVsHumanMode(indexOfBox);
    });
  });
}

function setUpEventListenerC() {
  Boxes.forEach((box, indexOfBox) => {
    box.addEventListener('click', () => {
      if (isPlayC && !wait) humanVsComputerMode(indexOfBox);
    });
  });
}

function checkWinCondition(gameMap) {
  const optionOfTurns = ['R', 'B'];

  class IsWinOb {
    constructor(isWinning, whoIsWinnig, winCells) {
      this.isWinning = isWinning;
      this.whoIsWinnig = whoIsWinnig;
      this.winCells = winCells;
    }
  }

  for (const turn of optionOfTurns) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 4; j++) {
        if (
          gameMap[i][j] === turn &&
          gameMap[i][j + 1] === turn &&
          gameMap[i][j + 2] === turn &&
          gameMap[i][j + 3] === turn
        ) {
          const winCells = [
            getIndex({ x: i, y: j }),
            getIndex({ x: i, y: j + 1 }),
            getIndex({ x: i, y: j + 2 }),
            getIndex({ x: i, y: j + 3 }),
          ];
          return new IsWinOb(true, turn, winCells);
        }
      }
    }

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          gameMap[i][j] === turn &&
          gameMap[i + 1][j] === turn &&
          gameMap[i + 2][j] === turn &&
          gameMap[i + 3][j] === turn
        ) {
          const winCells = [
            getIndex({ x: i, y: j }),
            getIndex({ x: i + 1, y: j }),
            getIndex({ x: i + 2, y: j }),
            getIndex({ x: i + 3, y: j }),
          ];

          return new IsWinOb(true, turn, winCells);
        }
      }
    }

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        if (
          gameMap[i][j] === turn &&
          gameMap[i + 1][j + 1] === turn &&
          gameMap[i + 2][j + 2] === turn &&
          gameMap[i + 3][j + 3] === turn
        ) {
          const winCells = [
            getIndex({ x: i, y: j }),
            getIndex({ x: i + 1, y: j + 1 }),
            getIndex({ x: i + 2, y: j + 2 }),
            getIndex({ x: i + 3, y: j + 3 }),
          ];

          return new IsWinOb(true, turn, winCells);
        }
      }
    }

    for (let i = 3; i < 6; i++) {
      for (let j = 0; j < 4; j++) {
        if (
          gameMap[i][j] === turn &&
          gameMap[i - 1][j + 1] === turn &&
          gameMap[i - 2][j + 2] === turn &&
          gameMap[i - 3][j + 3] === turn
        ) {
          const winCells = [
            getIndex({ x: i, y: j }),
            getIndex({ x: i - 1, y: j + 1 }),
            getIndex({ x: i - 2, y: j + 2 }),
            getIndex({ x: i - 3, y: j + 3 }),
          ];

          return new IsWinOb(true, turn, winCells);
        }
      }
    }
  }

  for (const i of gameMap) {
    for (const j of i) {
      if (j === 0) {
        return new IsWinOb(false, 'noBody', []);
      }
    }
  }

  return new IsWinOb(true, 'Tie', []);
}

function getElementsInColumn(column) {
  if (column < 0 || column > 7) throw new Error('get element in column :/');

  const boxesInColumn = [];

  for (let i = 0; i < 43; i++) {
    if (getColumn(i) === column) {
      boxesInColumn.push(i);
    } // TODO make more short and good. it work every time, fix that.
  }

  return boxesInColumn;
}

function getLowestBoxInColumn(gameMap, column) {
  if (column < 0 || column > 7) throw new Error('lowest box in column :/');

  for (let i = 42; i >= 0; i--) {
    if (getColumn(i) === column && checkIfCellEmpty(gameMap, i)) return i;
  }

  return false; // the column is full
}

function humanVsHumanMode(index) {
  if (getLowestBoxInColumn(gameMap, getColumn(index)) === false) return;

  gameMove(gameMap, userTurn, index, 'hvh');

  userTurn = userTurn == 'R' ? 'B' : 'R';
}

function setup(gameMap, mode) {
  if (mode !== 'hvh' && mode !== 'hvc') throw new Error('enter the game mode :/');

  resetMap(gameMap);
  resetBoard();

  if (mode === 'hvh') {
    isPlayH = true;
    HumanBtn.style.backgroundColor = 'rgb(93, 238, 225)';
    HumanBtn.style.boxShadow = '0 0 20px black';
    return;
  }

  isPlayC = true;
  ComputerBtn.style.backgroundColor = 'rgb(93, 238, 225)';
  ComputerBtn.style.boxShadow = '0 0 20px black';
}

function gameMove(gameMap, turn, index, mode) {
  const boxColumn = getColumn(index);
  const lowestBox = getLowestBoxInColumn(gameMap, boxColumn);

  setCell(gameMap, turn, undefined, undefined, lowestBox);

  changeBoard(lowestBox, turn);

  const { isWinning, whoIsWinnig, winCells } = checkWinCondition(gameMap);
  console.warn(whoIsWinnig, isWinning, 'game move');

  if (isWinning) {
    console.warn(whoIsWinnig, 'game move: winning');
    boardWinStatus(whoIsWinnig, winCells);
    isPlayH = false;
    isPlayC = false;
  }
}

function computerMove() {
  let randomTurn;

  do {
    randomTurn = Math.floor(Math.random() * 7);
  } while (getLowestBoxInColumn(randomTurn) !== false);

  return randomTurn;
}

function humanVsComputerMode(index) {
  if (getLowestBoxInColumn(gameMap, getColumn(index)) === false) return;

  gameMove(gameMap, userTurn, index, 'hvc');

  userTurn = 'B';

  wait = true;
  const randomTurn = computerMove();

  setTimeout(() => {
    if (!isPlayC) return;

    wait = false;
    gameMove(gameMap, 'B', randomTurn, 'hvc');
    userTurn = 'R';
  }, 1000);
}
