class canvas {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 600;
    this.canvas.height = 600;
    this.ctx = this.canvas.getContext("2d");
    document.getElementById("container").appendChild(this.canvas);
    this.gameBoard = document.getElementById("game-board");
    this.snakeElement = document.getElementById("snake");
    this.foodElement = document.getElementById("food");
  }

  drawSnake(snake) {
    // Clear existing snake segments
    this.snakeElement.innerHTML = '';
    
    // Create snake segments as div elements
    snake.forEach((segment, index) => {
      const snakeSegment = document.createElement('div');
      snakeSegment.className = index === 0 ? 'snake-segment snake-head' : 'snake-segment';
      snakeSegment.style.left = `${segment.x * 20}px`;
      snakeSegment.style.top = `${segment.y * 20}px`;
      
      // Add eyes to the snake head
      if (index === 0) {
        const eye1 = document.createElement('div');
        const eye2 = document.createElement('div');
        eye1.className = 'snake-eye';
        eye2.className = 'snake-eye';
        
        // Position eyes based on direction
        if (snake.length > 1) {
          if (segment.x > snake[1].x) { // Moving right
            eye1.style.left = '12px';
            eye1.style.top = '4px';
            eye2.style.left = '12px';
            eye2.style.top = '12px';
          } else if (segment.x < snake[1].x) { // Moving left
            eye1.style.left = '4px';
            eye1.style.top = '4px';
            eye2.style.left = '4px';
            eye2.style.top = '12px';
          } else if (segment.y > snake[1].y) { // Moving down
            eye1.style.left = '4px';
            eye1.style.top = '12px';
            eye2.style.left = '12px';
            eye2.style.top = '12px';
          } else { // Moving up
            eye1.style.left = '4px';
            eye1.style.top = '4px';
            eye2.style.left = '12px';
            eye2.style.top = '4px';
          }
        }
        
        snakeSegment.appendChild(eye1);
        snakeSegment.appendChild(eye2);
      }
      
      this.snakeElement.appendChild(snakeSegment);
    });
  }

  drawFood(food) {
    // Update food position
    this.foodElement.style.left = `${food.x * 20}px`;
    this.foodElement.style.top = `${food.y * 20}px`;
    
    // Ensure food is visible
    this.foodElement.classList.remove('hidden');
  }

  drawScore(score) {
    const scoreValue = document.getElementById('score-value');
    if (scoreValue) {
      scoreValue.textContent = score;
    }
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
    this.canvas.drawSnake(this.snake.snakeBoxes);

    this.gameSpeed;
    this.gameActive = false;
    this.gameStarted = false;
  }

  startGame() {
    // Hide the start message when game begins
    const gameStartMsg = document.getElementById('gamestart-message');
    if (gameStartMsg) {
      gameStartMsg.classList.add('hidden');
    }
    
    this.gameStarted = true;
    this.gameActive = true;
    this.gameSpeed = 10;
    this.snake.food.generateFood(this.snake.snakeBoxes);
    // Clear canvas but keep our HTML elements
    this.canvas.ctx.clearRect(
      0,
      0,
      this.canvas.canvas.width,
      this.canvas.canvas.height
    );
    const scoreDisplay = document.getElementById('score-display');
    scoreDisplay.classList.remove('hidden');
    this.snake.resetSnake();
    
    // Draw initial snake and food
    this.canvas.drawSnake(this.snake.snakeBoxes);
    this.canvas.drawFood(this.snake.food);
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
      
      // Clear canvas for any background effects
      this.canvas.ctx.clearRect(
        0,
        0,
        this.canvas.canvas.width,
        this.canvas.canvas.height
      );
      
      // Update HTML elements
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
    
    // Update the HTML-based game over screen
    const gameOverMsg = document.getElementById('gameover-message');
    const finalScore = document.getElementById('final-score');
    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) {
      scoreDisplay.classList.add('hidden');
    }
    if (gameOverMsg && finalScore) {
      finalScore.textContent = this.snake.score;
      gameOverMsg.classList.remove('hidden');
    }
    
    // Add event listener to restart button if it doesn't exist yet
    const restartButton = document.getElementById('restart-button');
    if (restartButton && !restartButton.hasAttribute('data-listener-added')) {
      restartButton.setAttribute('data-listener-added', 'true');
      restartButton.addEventListener('click', () => {
        gameOverMsg.classList.add('hidden');
        this.startGame();
      });
    }
  }

  startScreen() {
    // Draw the checkerboard background pattern
    this.canvas.ctx.fillStyle = "rgba(52, 152, 219, 0.1)";
    for (let i = 0; i < 600/20; i++) {
      for (let j = 0; j < 600/20; j++) {
        if ((i + j) % 2 === 0) {
          this.canvas.ctx.fillRect(i * 20, j * 20, 20, 20);
        }
      }
    }

    const scoreDisplay = document.getElementById('score-display');
    scoreDisplay.classList.add('hidden');
    // Show the HTML-based start screen
    const gameStartMsg = document.getElementById('gamestart-message');
    if (gameStartMsg) {
      gameStartMsg.classList.remove('hidden');
    }
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
  } else if (game.gameStarted && !game.gameActive) {
    // Hide the game over message when restarting with a key press
    const gameOverMsg = document.getElementById('gameover-message');
    if (gameOverMsg) {
      gameOverMsg.classList.add('hidden');
    }
    game.startGame();
  } else {
    game.startGame();
  }
});
