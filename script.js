class GameParameters {
  constructor() {
    this.speed = 100;
    this.size = 20;
    this.foodColor = "#e74c3c";
    this.snakeColor = "#27ae60";
    this.snakeHeadColor = "#2ecc71";
    
    this.loadFromInputs();
    
    this.setupEventListeners();
  }
  
  loadFromInputs() {
    const speedInput = document.getElementById('speed');
    const sizeInput = document.getElementById('size');
    const foodColorInput = document.getElementById('food-color');
    const snakeColorInput = document.getElementById('snake-color');
    
    if (speedInput) this.speed = parseInt(speedInput.value);
    if (sizeInput) this.size = parseInt(sizeInput.value);
    if (foodColorInput) this.foodColor = foodColorInput.value;
    if (snakeColorInput) this.snakeColor = snakeColorInput.value;
    
    const snakeRGB = this.hexToRgb(this.snakeColor);
    if (snakeRGB) {
      const lighterR = Math.min(255, snakeRGB.r + 20);
      const lighterG = Math.min(255, snakeRGB.g + 20);
      const lighterB = Math.min(255, snakeRGB.b + 20);
      this.snakeHeadColor = `rgb(${lighterR},${lighterG},${lighterB})`;
    }
  }
  
  hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    
    return { r, g, b };
  }
  
  setupEventListeners() {
    const applyButton = document.getElementById('apply-parameters');
    const resetButton = document.getElementById('reset-parameters');
    
    if (applyButton) {
      applyButton.addEventListener('click', () => {
        this.loadFromInputs();
        this.applyParameters();
      });
    }
    
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        const speedInput = document.getElementById('speed');
        const sizeInput = document.getElementById('size');
        const foodColorInput = document.getElementById('food-color');
        const snakeColorInput = document.getElementById('snake-color');
        
        if (speedInput) speedInput.value = 100;
        if (sizeInput) sizeInput.value = 20;
        if (foodColorInput) foodColorInput.value = "#ff0000";
        if (snakeColorInput) snakeColorInput.value = "#00ff00";
        
        this.loadFromInputs();
        this.applyParameters();
      });
    }
  }
  
  applyParameters() {
    document.documentElement.style.setProperty('--snake-color', this.snakeColor);
    document.documentElement.style.setProperty('--snake-head-color', this.snakeHeadColor);
    document.documentElement.style.setProperty('--food-color', this.foodColor);
    document.documentElement.style.setProperty('--cell-size', `${this.size}px`);
    
    if (window.game) {
      game.updateGameParameters(this);
    }
  }
}

class canvas {
  constructor(gameParameters) {
    this.parameters = gameParameters;
    this.canvas = document.createElement("canvas");
    this.canvas.width = 600;
    this.canvas.height = 600;
    this.ctx = this.canvas.getContext("2d");
    document.getElementById("container").appendChild(this.canvas);
    this.gameBoard = document.getElementById("game-board");
    this.snakeElement = document.getElementById("snake");
    this.foodElement = document.getElementById("food");
    
    this.updateStyles();
  }
  
  updateStyles() {
    if (this.foodElement) {
      this.foodElement.style.backgroundColor = this.parameters.foodColor;
      this.foodElement.style.boxShadow = `0 0 10px ${this.parameters.foodColor}`;
    }
  }

  drawSnake(snake) {
    this.snakeElement.innerHTML = '';
    
    const cellSize = this.parameters.size;
    
    snake.forEach((segment, index) => {
      const snakeSegment = document.createElement('div');
      snakeSegment.className = index === 0 ? 'snake-segment snake-head' : 'snake-segment';
      snakeSegment.style.left = `${segment.x * cellSize}px`;
      snakeSegment.style.top = `${segment.y * cellSize}px`;
      snakeSegment.style.width = `${cellSize}px`;
      snakeSegment.style.height = `${cellSize}px`;
      
      if (index === 0) {
        snakeSegment.style.backgroundColor = this.parameters.snakeHeadColor;
      } else {
        snakeSegment.style.backgroundColor = this.parameters.snakeColor;
      }
      
      if (index === 0) {
        const eye1 = document.createElement('div');
        const eye2 = document.createElement('div');
        eye1.className = 'snake-eye';
        eye2.className = 'snake-eye';
        
        const eyeSize = Math.max(4, cellSize * 0.2);
        eye1.style.width = `${eyeSize}px`;
        eye1.style.height = `${eyeSize}px`;
        eye2.style.width = `${eyeSize}px`;
        eye2.style.height = `${eyeSize}px`;
        
        // Position eyes based on direction
        if (snake.length > 1) {
          if (segment.x > snake[1].x) { // Moving right
            eye1.style.left = `${cellSize - eyeSize - 2}px`;
            eye1.style.top = `${eyeSize}px`;
            eye2.style.left = `${cellSize - eyeSize - 2}px`;
            eye2.style.top = `${cellSize - eyeSize * 2}px`;
          } else if (segment.x < snake[1].x) { // Moving left
            eye1.style.left = `${2}px`;
            eye1.style.top = `${eyeSize}px`;
            eye2.style.left = `${2}px`;
            eye2.style.top = `${cellSize - eyeSize * 2}px`;
          } else if (segment.y > snake[1].y) { // Moving down
            eye1.style.left = `${eyeSize}px`;
            eye1.style.top = `${cellSize - eyeSize - 2}px`;
            eye2.style.left = `${cellSize - eyeSize * 2}px`;
            eye2.style.top = `${cellSize - eyeSize - 2}px`;
          } else { // Moving up
            eye1.style.left = `${eyeSize}px`;
            eye1.style.top = `${2}px`;
            eye2.style.left = `${cellSize - eyeSize * 2}px`;
            eye2.style.top = `${2}px`;
          }
        }
        
        snakeSegment.appendChild(eye1);
        snakeSegment.appendChild(eye2);
      }
      
      this.snakeElement.appendChild(snakeSegment);
    });
  }

  drawFood(food) {
    const cellSize = this.parameters.size;
    
    this.foodElement.style.left = `${food.x * cellSize}px`;
    this.foodElement.style.top = `${food.y * cellSize}px`;
    this.foodElement.style.width = `${cellSize}px`;
    this.foodElement.style.height = `${cellSize}px`;
    
    this.foodElement.classList.remove('hidden');
  }

  drawScore(score) {
    const scoreValue = document.getElementById('score-value');
    if (scoreValue) {
      scoreValue.textContent = score;
    }
  }
  
  updateParameters(newParams) {
    this.parameters = newParams;
    this.updateStyles();
  }
}

class Snake {
  constructor(gameParameters) {
    this.parameters = gameParameters;
    this.snakeBoxes = [
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 5, y: 7 },
    ];
    this.food = new Food(this.snakeBoxes, this.parameters);
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
    const boardSize = 600 / this.parameters.size;
    if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
      return true;
    }
    return false;
  }
  
  updateParameters(newParams) {
    this.parameters = newParams;
    this.food.updateParameters(newParams);
  }
}

class Food {
  constructor(snakeBoxes = [], gameParameters) {
    this.parameters = gameParameters;
    this.generateFood(snakeBoxes);
  }

  generateFood(snakeBoxes = []) {
    let validPosition = false;
    let x, y;
    
    const boardSize = 600 / this.parameters.size;

    while (!validPosition) {
      x = Math.floor(Math.random() * boardSize);
      y = Math.floor(Math.random() * boardSize);

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
  
  updateParameters(newParams) {
    this.parameters = newParams;
  }
}

class Game {
  constructor() {
    this.parameters = new GameParameters();
    this.canvas = new canvas(this.parameters);
    this.snake = new Snake(this.parameters);

    this.food = this.snake.food;
    this.score = this.snake.score;

    this.canvas.drawFood(this.food);
    this.canvas.drawSnake(this.snake.snakeBoxes);

    this.gameSpeed = this.parameters.speed / 10;
    this.gameActive = false;
    this.gameStarted = false;

    this.bgAudio = document.getElementById("bg-music");
    this.gameStartAudio = document.getElementById("game-start-audio");
    this.gameOverAudio = document.getElementById("game-over-audio");
    this.foodEatenAudio = document.getElementById("food-eaten-audio");
    this.foodPopupAudio = document.getElementById("food-popup-audio");
    this.gameSettingsChangedAudio = document.getElementById('settings-changed-audio');

    if (this.bgAudio) {
      // this.bgAudio.volume = 0.1;
      this.bgAudio.loop = true;
      this.prepareAudio(this.bgAudio);
    }
    
    this.prepareAudio(this.gameStartAudio);
    this.prepareAudio(this.gameOverAudio);
    this.prepareAudio(this.foodEatenAudio);
    this.prepareAudio(this.foodPopupAudio);
    this.prepareAudio(this.gameSettingsChangedAudio);
    
    this.audioContext = null;

    this.gameOverAudioPlayed = false;
    window.game = this;
  }

  prepareAudio(audioElement) {
    if (audioElement) {
      audioElement.load();
      audioElement.preload = "auto";
    }
  }
  
  playAudio(audioElement) {
    if (!audioElement) return;
    
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const playPromise = audioElement.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Autoplay prevented:", error);
      });
    }
  }

  startGame() {
    const gameStartMsg = document.getElementById('gamestart-message');
    if (gameStartMsg) {
      gameStartMsg.classList.add('hidden');
    }
    
    if (this.bgAudio) {
      this.bgAudio.currentTime = 0;
      this.bgAudio.playbackRate = 1.0; 
      this.playAudio(this.bgAudio);
    }
    
    if (this.gameStartAudio) {
      this.gameStartAudio.currentTime = 0;
      this.playAudio(this.gameStartAudio);
    }
    
    this.gameStarted = true;
    this.gameActive = true;
    this.gameSpeed = this.parameters.speed / 10;
    this.snake.food.generateFood(this.snake.snakeBoxes);
    this.gameOverAudioPlayed = false;
    this.canvas.ctx.clearRect(
      0,
      0,
      this.canvas.canvas.width,
      this.canvas.canvas.height
    );
    
    const scoreDisplay = document.getElementById('score-display');
    scoreDisplay.classList.remove('hidden');
    this.snake.resetSnake();
    
    this.canvas.drawSnake(this.snake.snakeBoxes);
    this.canvas.drawFood(this.snake.food);
  }

  gameloop() {
    if (this.gameActive && this.gameStarted) {
      this.snake.move(this.snake.direction);
      if (this.snake.ate) {
        this.gameSpeed += (this.parameters.speed / 1000);
        if (this.bgAudio) {
          const maxPlaybackRate = 2.0;
          const minPlaybackRate = 1.0;
          const scoreMultiplier = 0.01;
          
          // Increase playback rate based on score, up to a maximum
          const newRate = Math.min(
            maxPlaybackRate,
            minPlaybackRate + (this.snake.score * scoreMultiplier)
          );
          
          this.bgAudio.playbackRate = newRate;
        }
        this.snake.ate = false;
        
        if (this.foodPopupAudio) {
          this.foodPopupAudio.currentTime = 0;
          this.playAudio(this.foodPopupAudio);
        }
        
        if (this.foodEatenAudio) {
          this.foodEatenAudio.currentTime = 0;
          this.playAudio(this.foodEatenAudio);
        }
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
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
    if (this.gameOverAudio && !this.gameOverAudioPlayed) {
      this.gameOverAudioPlayed = true;
      this.gameOverAudio.currentTime = 0;
      this.playAudio(this.gameOverAudio);
    }
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
    this.canvas.ctx.fillStyle = "rgba(52, 152, 219, 0.1)";
    const cellSize = this.parameters.size;
    const boardSize = 600 / cellSize;
    
    this.canvas.ctx.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);

    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if ((i + j) % 2 === 0) {
          this.canvas.ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }

    const scoreDisplay = document.getElementById('score-display');
    scoreDisplay.classList.add('hidden');
    const gameOverMsg = document.getElementById('gameover-message');
    if (gameOverMsg) {
      gameOverMsg.classList.add('hidden');
    }

    
    const gameStartMsg = document.getElementById('gamestart-message');
    
    if (gameStartMsg && !this.gameStarted) {
      gameStartMsg.classList.remove('hidden');
    }
  }
  
  updateGameParameters(newParams) {
    this.parameters = newParams;
    this.gameSpeed = this.parameters.speed / 10;
    
    this.canvas.updateParameters(newParams);
    this.snake.updateParameters(newParams);
    
    if (this.gameSettingsChangedAudio) {
      this.gameSettingsChangedAudio.currentTime = 0;
      this.playAudio(this.gameSettingsChangedAudio);
    }
    
    if (this.gameStarted && this.gameActive) {
      this.canvas.drawSnake(this.snake.snakeBoxes);
      this.canvas.drawFood(this.food);
    } else if (this.gameStarted && !this.gameActive){
      const gameStartMsg = document.getElementById('gamestart-message');
    if (gameStartMsg) {
      gameStartMsg.classList.add('hidden');
    }
    this.canvas.ctx.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
    this.canvas.ctx.fillStyle = "rgba(52, 152, 219, 0.1)";
    const cellSize = this.parameters.size;
    const boardSize = 600 / cellSize;
    
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if ((i + j) % 2 === 0) {
          this.canvas.ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
    }
    else{
      this.startScreen();
    }
  }
}


const style = document.createElement('style');
style.textContent = `
:root {
  --snake-color: #27ae60;
  --snake-head-color: #2ecc71;
  --food-color: #e74c3c;
  --cell-size: 20px;
}
`;
document.head.appendChild(style);

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
    const gameOverMsg = document.getElementById('gameover-message');
    if (gameOverMsg) {
      gameOverMsg.classList.add('hidden');
    }
    game.startGame();
  } else {
    game.startGame();
  }
});

const showSettings = document.getElementById('show-gamesettings');
showSettings.addEventListener('click', () => {
  const settings = document.getElementById('change-parameters');
  if (settings) {
    if (settings.classList.contains('hidden')) {
      settings.classList.remove('hidden');
    } else {
      settings.classList.add('hidden');
    }
  }
});

