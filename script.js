class canvas {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 600;
    this.canvas.height = 600;
    this.ctx = this.canvas.getContext("2d");
    document.getElementById("container").appendChild(this.canvas);
  }
  drawSnake(snake) {
    this.ctx.fillStyle = "#2ecc71";
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    this.ctx.shadowBlur = 5;

    const head = snake[0];
    this.ctx.fillRect(head.x * 20, head.y * 20, 20, 20);

    this.ctx.fillStyle = "#27ae60";
    for (let i = 1; i < snake.length; i++) {
      this.ctx.fillRect(snake[i].x * 20, snake[i].y * 20, 20, 20);
    }

    this.ctx.shadowBlur = 0;

    this.ctx.fillStyle = "white";
    const eyeSize = 4;

    if (snake.length > 1) {
      if (head.x > snake[1].x) {
        this.ctx.fillRect(head.x * 20 + 12, head.y * 20 + 4, eyeSize, eyeSize);
        this.ctx.fillRect(head.x * 20 + 12, head.y * 20 + 12, eyeSize, eyeSize);
      } else if (head.x < snake[1].x) {
        this.ctx.fillRect(head.x * 20 + 4, head.y * 20 + 4, eyeSize, eyeSize);
        this.ctx.fillRect(head.x * 20 + 4, head.y * 20 + 12, eyeSize, eyeSize);
      } else if (head.y > snake[1].y) {
        this.ctx.fillRect(head.x * 20 + 4, head.y * 20 + 12, eyeSize, eyeSize);
        this.ctx.fillRect(head.x * 20 + 12, head.y * 20 + 12, eyeSize, eyeSize);
      } else {
        this.ctx.fillRect(head.x * 20 + 4, head.y * 20 + 4, eyeSize, eyeSize);
        this.ctx.fillRect(head.x * 20 + 12, head.y * 20 + 4, eyeSize, eyeSize);
      }
    }
  }

  drawFood(food) {
    const x = food.x * 20;
    const y = food.y * 20;

    this.ctx.shadowColor = "rgba(231, 76, 60, 0.8)";
    this.ctx.shadowBlur = 10;

    this.ctx.fillStyle = "#e74c3c";
    this.ctx.beginPath();
    this.ctx.arc(x + 10, y + 10, 8, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#7f8c8d";
    this.ctx.fillRect(x + 10, y + 2, 2, 4);

    this.ctx.shadowBlur = 0;
  }

  drawScore(score) {
    this.ctx.fillStyle = "#2c3e50";
    this.ctx.font = "bold 20px Arial";
    this.ctx.fillText("Score: " + score, 10, 25);
  }
}
class Snake {
  constructor() {
    this.snakeBoxes = [
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 5, y: 7 },
    ];
    this.food = new Food(this.snakeBoxes);
    this.score = 0;
    this.direction = "right";
    this.ate = false;
  }
  move(dir) {
    let head = this.snakeBoxes[0];
    let newHead;
    switch (dir) {
      case "up":
        newHead = { x: head.x, y: head.y - 1 };
        break;
      case "down":
        newHead = { x: head.x, y: head.y + 1 };
        break;
      case "left":
        newHead = { x: head.x - 1, y: head.y };
        break;
      case "right":
        newHead = { x: head.x + 1, y: head.y };
        break;
    }
    this.direction = dir;
    this.snakeBoxes.unshift(newHead);
    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score++;
      this.ate = true;
      this.food.generateFood(this.snakeBoxes);
    } else {
      this.snakeBoxes.pop();
    }
  }

  resetSnake() {
    this.snakeBoxes = [
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 5, y: 7 },
    ];
    this.score = 0;
    this.direction = "right";
  }
  checkSelfCollision() {
    for (let i = 1; i < this.snakeBoxes.length; i++) {
      if (
        this.snakeBoxes[i].x === this.snakeBoxes[0].x &&
        this.snakeBoxes[i].y === this.snakeBoxes[0].y
      ) {
        return true;
      }
    }
    return false;
  }
  checkBoundries() {
    let head = this.snakeBoxes[0];
    if (head.x < 0 || head.x >= 600/20 || head.y < 0 || head.y >= 600/20) {
      return true;
    }
    return false;
  }
}

class Food {
  constructor(snakeBoxes = []) {
    this.generateFood(snakeBoxes);
  }

  generateFood(snakeBoxes = []) {
    let validPosition = false;
    let x, y;

    while (!validPosition) {
      x = Math.floor(Math.random() * 600/20);
      y = Math.floor(Math.random() * 600/20);

      validPosition = true;
      if (snakeBoxes.length > 0) {
        for (const part of snakeBoxes) {
          if (part.x === x && part.y === y) {
            validPosition = false;
            break;
          }
        }
      }
    }

    this.x = x;
    this.y = y;
  }
}

class Game {
  constructor() {
    this.canvas = new canvas();
    this.snake = new Snake();

    this.food = this.snake.food;
    this.score = this.snake.score;

    this.canvas.drawFood(this.food);

    this.gameSpeed;
    this.gameActive = false;
    this.gameStarted = false;
  }

  startGame() {
    this.gameStarted = true;
    this.gameActive = true;
    this.gameSpeed = 10;
    this.snake.food.generateFood(this.snake.snakeBoxes);
    this.canvas.ctx.clearRect(
      0,
      0,
      this.canvas.canvas.width,
      this.canvas.canvas.height
    );
    this.snake.resetSnake();
  }

  gameloop() {
    if (this.gameActive && this.gameStarted) {
      this.snake.move(this.snake.direction);
      if (this.snake.ate) {
        this.gameSpeed += 0.1;
        this.snake.ate = false;
      }
      this.checkCollision();
      this.score = this.snake.score;
      this.food = this.snake.food;
      this.canvas.ctx.clearRect(
        0,
        0,
        this.canvas.canvas.width,
        this.canvas.canvas.height
      );
      this.canvas.drawSnake(this.snake.snakeBoxes);
      this.canvas.drawFood(this.food);
      this.canvas.drawScore(this.score);
    } else if (this.gameStarted) {
      this.endGame();
    } else {
      this.startScreen();
    }
    setTimeout(() => {
      requestAnimationFrame(this.gameloop.bind(this));
    }, 1000 / this.gameSpeed);
  }

  checkCollision() {
    if (this.snake.checkBoundries() || this.snake.checkSelfCollision()) {
      this.endGame();
    }
  }

  endGame() {
    this.gameActive = false;
    this.canvas.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.canvas.ctx.fillRect(
      0,
      0,
      this.canvas.canvas.width,
      this.canvas.canvas.height
    );

    const gradient = this.canvas.ctx.createLinearGradient(100, 100, 300, 200);
    gradient.addColorStop(0, "#e74c3c");
    gradient.addColorStop(1, "#c0392b");
    this.canvas.ctx.fillStyle = gradient;
    this.canvas.ctx.font = "bold 40px Arial";
    this.canvas.ctx.fillText("Game Over", 200, 280);

    this.canvas.ctx.fillStyle = "white";
    this.canvas.ctx.font = "30px Arial";
    this.canvas.ctx.fillText("Score: " + this.snake.score, 230, 330);

    this.canvas.ctx.fillStyle = "#3498db";
    this.canvas.ctx.font = "20px Arial";
    this.canvas.ctx.fillText("Press any key to restart", 190, 380);
  }

  startScreen() {
    this.canvas.ctx.fillStyle = "rgba(52, 152, 219, 0.1)";
    for (let i = 0; i < 600/20; i++) {
      for (let j = 0; j < 600/20; j++) {
        if ((i + j) % 2 === 0) {
          this.canvas.ctx.fillRect(i * 20, j * 20, 20, 20);
        }
      }
    }

    this.canvas.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    this.canvas.ctx.shadowBlur = 10;
    this.canvas.ctx.shadowOffsetY = 4;

    this.canvas.ctx.fillStyle = "#2ecc71";
    this.canvas.ctx.font = "bold 40px Arial";
    this.canvas.ctx.fillText("SNAKE", 230, 250);

    this.canvas.ctx.shadowBlur = 5;
    this.canvas.ctx.fillStyle = "black";
    this.canvas.ctx.font = "20px Arial";
    this.canvas.ctx.fillText("Press any key to start", 200, 300);

    this.canvas.ctx.shadowBlur = 0;
    this.canvas.ctx.shadowOffsetY = 0;
  }
}

const game = new Game();
game.gameloop();

document.addEventListener("keydown", (event) => {
  if (game.gameStarted && game.gameActive) {
    const currentDir = game.snake.direction;
    switch (event.key) {
      case "ArrowUp":
        if (currentDir !== "down") game.snake.direction = "up";
        break;
      case "ArrowDown":
        if (currentDir !== "up") game.snake.direction = "down";
        break;
      case "ArrowLeft":
        if (currentDir !== "right") game.snake.direction = "left";
        break;
      case "ArrowRight":
        if (currentDir !== "left") game.snake.direction = "right";
        break;
    }
  } else {
    game.startGame();
  }
});
