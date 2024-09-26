document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  let squares = Array.from(document.querySelectorAll(".grid div"));
  const scoreDisplay = document.querySelector("#score");
  const startBtn = document.querySelector("#start-button");
  const speedPlusBtn = document.querySelector(".speed-plus");
  const speedMinusBtn = document.querySelector(".speed-minus");
  const speedEl = document.querySelector(".speed-el");
  const restartBtn = document.querySelector(".restart");
  let currentSpeed = 500;
  const width = 10;
  let timerId;
  let score = 0;
  const colors = ["lightskyblue", "pink", "plum", "lightsalmon", "darkkhaki"];
  const lTetromino = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2],
  ];
  const zTetromino = [
    [width * 2, width * 2 + 1, width + 1, width + 2],
    [0, width, width + 1, width * 2 + 1],
    [width * 2, width * 2 + 1, width + 1, width + 2],
    [0, width, width + 1, width * 2 + 1],
  ];
  const tTetromino = [
    [width, width + 1, width + 2, 1],
    [1, width + 1, width * 2 + 1, width + 2],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1],
  ];
  const oTetromino = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
  ];
  const iTetromino = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
  ];
  const theTetrominoes = [
    lTetromino,
    zTetromino,
    tTetromino,
    oTetromino,
    iTetromino,
  ];
  let currentPosition = 4;
  let currentRotation = 0;
  let random = Math.floor(Math.random() * theTetrominoes.length);
  const displaySquares = document.querySelectorAll(".mini-grid div");
  const displayWidth = 4;
  let displayIndex = 0;
  const upNextTetrominoes = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2],
    [
      displayWidth * 2,
      displayWidth * 2 + 1,
      displayWidth + 1,
      displayWidth + 2,
    ],
    [displayWidth, displayWidth + 1, displayWidth + 2, 1],
    [0, 1, displayWidth, displayWidth + 1],
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1],
  ];
  let nextRandom;
  let current = theTetrominoes[random][currentRotation];
  let highestScoreEl = document.querySelector(".highest-score-el");
  let highestScore = 0;
  if (localStorage.getItem("highestScore")) {
    highestScore = localStorage.getItem("highestScore");
  }
  highestScoreEl.innerHTML = highestScore;
  let gameOverEl = document.querySelector(".game-over");
  function draw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.add("tetromino");
      squares[currentPosition + index].style.backgroundColor = colors[random];
    });
  }
  /*
current means the chosen Tetromino
index stands for each element in Tetromino Arrat
currentPosition+ means each element is 4 from left
squares[currentPosition + index] points to the square
.classList.add('tetromino') is to add class name of 'tetromino' to the element square(.grid div)
*/
  function undraw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.remove("tetromino");
      squares[currentPosition + index].style.backgroundColor = "";
    });
  }
  //assign functions to keyCodes
  function control(e) {
    if (timerId) {
      switch (e.keyCode) {
        case 37:
          moveLeft();
          break;
        case 38:
          rotate();
          break;
        case 39:
          moveRight();
      }
    }
  }
  document.addEventListener("keyup", control);
  document.addEventListener("keydown", (e) => {
    if (timerId) {
      if (e.keyCode === 40) {
        moveDown();
      }
    }
  });
  function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze();
  }
  function freeze() {
    if (
      current.some((index) =>
        squares[currentPosition + index + width].classList.contains("taken"),
      )
    ) {
      current.forEach((index) =>
        squares[currentPosition + index].classList.add("taken"),
      );
      currentPosition = 4;
      random = nextRandom; //this equation need to come before nextRandom equation so that new Tetromino uses the old random value from displayShape ()
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      current = theTetrominoes[random][currentRotation];
      displayShape();
      draw();
      /*once freeze is ivoked, the current tetrimino stays at same position
		new tetrimino is created, so the undrew function is working on new tetrimino*/
      addScore();
      gameOver();
    }
  }
  function isAtLeftEdge() {
    return current.some((index) => (currentPosition + index) % width === 0);
  }
  function isAtRightEdge() {
    return current.some(
      (index) => (currentPosition + index) % width === width - 1,
    );
  }
  //move the tetromino left, unless is at the edge or there is a blockage
  function moveLeft() {
    undraw();
    if (!isAtLeftEdge()) currentPosition -= 1;
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken"),
      )
    ) {
      currentPosition += 1;
    }
    draw();
    freeze();
  }
  function moveRight() {
    undraw();
    if (!isAtRightEdge()) currentPosition += 1;
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken"),
      )
    ) {
      currentPosition -= 1;
    }
    draw();
    freeze();
  }
  function checkRotate() {
    let P = (currentPosition + 1) % width;
    if (P > 7 && isAtLeftEdge()) {
      currentPosition -= 1;
      checkRotate();
    } else if (P < 3 && isAtRightEdge()) {
      currentPosition += 1;
      checkRotate();
    }
  }
  function rotate() {
    let cp = currentPosition;
    let cr = currentRotation;
    undraw();
    currentRotation++;
    if (currentRotation === current.length) {
      //if the current rotation gets to 4, make it go back to 0
      currentRotation = 0;
    }
    current = theTetrominoes[random][currentRotation];
    checkRotate();
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken"),
      )
    ) {
      currentPosition = cp;
      currentRotation = cr;
    }
    current = theTetrominoes[random][currentRotation];
    draw();
    freeze();
  }
  //show up-next tetromino in mini-grid
  //the tetrominoes without rotations
  function displayShape() {
    //remove any trace of a tetromino from the entire grid
    displaySquares.forEach((square) => {
      square.classList.remove("tetromino");
      square.style.backgroundColor = "";
    });
    upNextTetrominoes[nextRandom].forEach((index) => {
      //dont know why this nextRandom value will be passed to random in freeze()
      displaySquares[displayIndex + index].classList.add("tetromino");
      displaySquares[displayIndex + index].style.backgroundColor =
        colors[nextRandom];
    });
  }
  //add functionality to the button
  speedPlusBtn.addEventListener("click", () => {
    if (currentSpeed > 100 && currentSpeed < 900) {
      currentSpeed += 100;
    }
    speedEl.innerHTML = currentSpeed;
    if (timerId) {
      clearInterval(timerId);
      timerId = setInterval(moveDown, currentSpeed);
    }
  });
  speedMinusBtn.addEventListener("click", () => {
    if (currentSpeed > 100) {
      currentSpeed -= 100;
    }
    speedEl.innerHTML = currentSpeed;
    if (timerId) {
      clearInterval(timerId);
      timerId = setInterval(moveDown, currentSpeed);
    }
  });
  startBtn.addEventListener("click", () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    } else {
      draw();
      timerId = setInterval(moveDown, currentSpeed);
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      displayShape();
    }
  });
  function addScore() {
    for (let i = 0; i < 199; i += width) {
      const row = [
        i,
        i + 1,
        i + 2,
        i + 3,
        i + 4,
        i + 5,
        i + 6,
        i + 7,
        i + 8,
        i + 9,
      ];
      if (row.every((index) => squares[index].classList.contains("taken"))) {
        score += 10;
        scoreDisplay.innerHTML = score;
        row.forEach((index) => {
          squares[index].classList.remove("taken");
          squares[index].classList.remove("tetromino");
          squares[index].style.backgroundColor = "";
        });
        const squaresRemoved = squares.splice(i, width);
        squares = squaresRemoved.concat(squares);
        squares.forEach((cell) => grid.appendChild(cell));
        changeSpeed();
      }
    }
  }
  function changeSpeed() {
    if (score > 100) {
      currentSpeed = 100;
    } else if (score > 70) {
      currentSpeed = 200;
    } else if (score > 40) {
      currentSpeed = 300;
    } else if (score > 20) {
      currentSpeed = 400;
    }
    speedEl.innerHTML = currentSpeed;
    clearInterval(timerId);
    timerId = setInterval(moveDown, currentSpeed);
  }
  function gameOver() {
    if (timerId) {
      if (
        current.some((index) =>
          squares[currentPosition + index].classList.contains("taken"),
        )
      ) {
        clearInterval(timerId);
        timerId = null;
        gameOverEl.style.visibility = "visible";
        if (score > highestScore) {
          localStorage.removeItem("highestScore");
          localStorage.setItem("highestScore", score);
          highestScoreEl.innerHTML = score;
        }
      }
    }
  }
  function restart() {
    if (timerId === null) {
      for (let i = 0; i < 200; i++) {
        squares[i].classList.remove("taken");
        squares[i].classList.remove("tetromino");
        squares[i].style.backgroundColor = "";
      }
      score = 0;
      scoreDisplay.innerHTML = score;
      currentSpeed = 500;
      speedEl.innerHTML = currentSpeed;
      gameOverEl.style.visibility = "hidden";
      currentPosition = 4;
      currentRotation = 0;
      random = Math.floor(Math.random() * theTetrominoes.length);
      current = theTetrominoes[random][currentRotation];
      draw();
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      displayShape();
      timerId = setInterval(moveDown, currentSpeed);
    }
  }
  restartBtn.addEventListener("click", restart);
});
