import styles from './game.module.css';

type Coordinates = {
  x: number;
  y: number;
}

export class Game {
  pixelSize = 10;
  arenaElement: HTMLElement;
  arenaSize: { width: number; height: number; };
  foodElement: HTMLDivElement | null;
  snakeHeadPosition: Coordinates;
  snakeBody: Coordinates[];
  snakeDirection: string;
  snakeFoodPosition: Coordinates | null;
  enlongate: boolean;
  paused: boolean;
  menuElement: HTMLElement | null;
  intiGame: any;
  goThroughWalls: boolean;
  SnakeMovementTimer: ReturnType<typeof setInterval> | null;
  over: boolean;

  // TODO zeptat se, co ma byt v constructoru a co v initu
  constructor(arenaElement: HTMLElement) {
    this.goThroughWalls = false
    this.arenaElement = arenaElement;
    this.arenaSize = this.defineArenaSize();
    this.snakeHeadPosition = {x: 0, y: 0};
    this.snakeDirection = 'right';
    this.snakeBody = [this.snakeHeadPosition]; 
    this.snakeFoodPosition = null;
    this.enlongate = false;
    this.foodElement = null;
    this.paused = false;
    this.menuElement = null;
    this.SnakeMovementTimer = null;
    this.over = false;
    window.addEventListener('keydown', this.handleKeyPress);
  }

  initGame = () => {
    console.log('init called')
    this.foodElement = this.generateFood();
    this.menuElement = this.createClickableElement();
    this.animateSnake();
  }

  reinitGame = () => {
    this.snakeHeadPosition = {x: 0, y: 0};
    this.snakeBody = [this.snakeHeadPosition];
    this.snakeDirection = 'right';
    this.paused = false;
    this.over = false;
    this.clearGameField();
    this.initGame();
  }

  // call this function on reinit
  clearGameField = () => {
    // remove all children of arena
    this.arenaElement.innerHTML = ''
  }

  defineArenaSize = () => {
    const originalWidth = this.arenaElement.offsetWidth;
    const originalHeight = this.arenaElement.offsetHeight;
    
    const width = originalWidth/this.pixelSize;
    const height = originalHeight/this.pixelSize;
    
    console.log('1', width, height);
    return {width, height};
  }
// TODO v kontruktoru pouze inicializovat to nejdulezitejsi, potom vytvorit init funkci kterou volat az po inicializaci classy v miste kde je pouzita


  createClickableElement = () => {
    const menuElement = document.createElement('div');
    const buttonElement = document.createElement('button');
    menuElement.classList.add(styles.menu);
    buttonElement.classList.add(styles.button)
    menuElement.innerHTML = '<div>game over</div>'
    buttonElement.innerHTML = 'play again'
    buttonElement.setAttribute('type', 'button')
    buttonElement.addEventListener('click', this.reinitGame);
    this.arenaElement.append(menuElement)
    menuElement.append(buttonElement)
    return menuElement;
  }

  renderSnakeCell = (coordinates: Coordinates) => {
    console.log('render', coordinates)
    const matchingElements: HTMLDivElement | null = document.querySelector(`[coordinates="${coordinates?.x},${coordinates?.y}"]`);
    if (matchingElements) {
      return;
    }
    // console.log('rendering', coordinates)
    const snakeCell = document.createElement('div');
    snakeCell.classList.add(styles.snake);
    snakeCell.style.width = `${this.pixelSize}px`;
    snakeCell.style.height = `${this.pixelSize}px`;
    snakeCell.style.top = `${coordinates.y*this.pixelSize}px`;
    snakeCell.style.left = `${coordinates.x*this.pixelSize}px`;
    snakeCell.setAttribute('coordinates', `${coordinates.x},${coordinates.y}`)
    this.arenaElement.appendChild(snakeCell);
  }

  unrenderSnakeElement = (coordinates: Coordinates | undefined) => {
    const matchingElements: HTMLDivElement | null = document.querySelector(`[coordinates="${coordinates?.x},${coordinates?.y}"]`);
    // console.log('delete', matchingElements, coordinates)
    if (matchingElements) {
      matchingElements.style.background = 'blue';
    }
    matchingElements?.remove()
  }

  generateFood = () => {
    const getRandomPosition = (maxValue: number) => {
      const getRandomInt = () => {
        let max = Math.floor(maxValue);
        return Math.floor(Math.random() * (max));
      }
      return getRandomInt()
    }
    const foodElement = document.createElement('div');
    foodElement.classList.add(styles.food);
    foodElement.style.width = `${this.pixelSize}px`;
    foodElement.style.height = `${this.pixelSize}px`;
    let snakeFoodCoordinates = {
      x: getRandomPosition(this.arenaSize.height),
      y: getRandomPosition(this.arenaSize.width)
    }
    foodElement.style.top = `${snakeFoodCoordinates.y*this.pixelSize}px`;
    foodElement.style.left = `${snakeFoodCoordinates.x*this.pixelSize}px`;
    console.log('2', snakeFoodCoordinates, this.snakeFoodPosition);
    this.snakeFoodPosition = snakeFoodCoordinates;
    console.log('3', snakeFoodCoordinates, this.snakeFoodPosition);
    this.arenaElement.appendChild(foodElement);
    return foodElement;
  }

  gameOver = (show: boolean) => {
    console.log('game over');
    if (show === true) {
      this.menuElement?.classList.add(styles.visible)
      this.over = true;
      this.paused = true;
    } 
    if (show === false) {
      this.menuElement?.classList.remove(styles.visible);
      this.over = false;
      this.paused = false;
    }
  }

  moveSnake = (direction: string) => {
    console.log('0');
    switch (direction) {
      case 'up':
        this.snakeHeadPosition.y--;
        break;
      case 'down':
        this.snakeHeadPosition.y++;
        break;
      case 'left':
        this.snakeHeadPosition.x--;
        break;
      case 'right':
        this.snakeHeadPosition.x++;
        break;
      default:
        break;
    }
    // pokud had vyjede z hraci plochy, tak se objevi na druhe strane
    if (this.goThroughWalls) {
      if (this.snakeHeadPosition.x >= this.arenaSize.width) {
        this.snakeHeadPosition.x = 0;
      }
      if (this.snakeHeadPosition.x < 0) {
        this.snakeHeadPosition.x = this.arenaSize.width-1;
      }
      if (this.snakeHeadPosition.y >= this.arenaSize.height) {
        this.snakeHeadPosition.y = 0;
      }
      if (this.snakeHeadPosition.y < 0) {
        this.snakeHeadPosition.y = this.arenaSize.height-1;
      }
    } else {
      if (this.snakeHeadPosition.x >= this.arenaSize.width) {
        console.log('01', this.snakeHeadPosition);
        this.gameOver(true)
        return;
      }
      if (this.snakeHeadPosition.x < 0) {
        console.log('02', this.snakeHeadPosition);
        this.gameOver(true)
        return;
      }
      if (this.snakeHeadPosition.y >= this.arenaSize.height) {
        console.log('03', this.snakeHeadPosition);
        this.gameOver(true)
        return;
      }
      if (this.snakeHeadPosition.y < 0) {
        console.log('04', this.snakeHeadPosition);
        this.gameOver(true)
        return;
      }
    }

    // if snake bites his own tail, game over
    if (this.snakeBody.find(value => {return value.x === this.snakeHeadPosition.x && value.y === this.snakeHeadPosition.y}) && this.snakeBody.length > 4 ) {
      this.gameOver(true)
    }
    // move snakebody
    this.snakeBody.push({x: this.snakeHeadPosition.x, y: this.snakeHeadPosition.y}); 

    // unrender element in case snake didn't eat
    const getCellToUnrender = () => {
      if (this.snakeBody.length === 1) {
        return this.snakeBody[0]
      } else if (this.enlongate === true) {
        console.log('skip cut')
        this.enlongate = false
        return undefined
      }
      else {
        return this.snakeBody.shift()
      }
    }
    this.unrenderSnakeElement(getCellToUnrender())
    // render each snake cell
    console.log('1');
    this.snakeBody.map(cell => this.renderSnakeCell(cell))
  }


  animateSnake = () => {
    const snakeSpeedInMs = 100;
    const snakeMovementTimer = setInterval(() => {
      console.log('5');
      if (!this.paused) {
        console.log('6');
        if ( this.snakeHeadPosition.x === this.snakeFoodPosition?.x &&
          this.snakeHeadPosition.y === this.snakeFoodPosition?.y) {
          console.log('hit')
          this.foodElement?.remove()
          this.snakeFoodPosition = null;
          this.foodElement = this.generateFood()
          this.enlongate = true;
        }
        this.moveSnake(this.snakeDirection);
      }

      console.log('7', this.over)
      if (this.over) {
        clearInterval(snakeMovementTimer);
      }
    }
    , snakeSpeedInMs);
  }

  // snake can't reverse
  setSnakeDirection = (direction: string) => {
    if (direction === 'up' && this.snakeDirection === 'down') {
      return;
    }
    if (direction === 'down' && this.snakeDirection === 'up') {
      return;
    }
    if (direction === 'left' && this.snakeDirection === 'right') {
      return;
    }
    if (direction === 'right' && this.snakeDirection === 'left') {
      return;
    }
    this.snakeDirection = direction;
  }

  togglePlayPause = () => {
    this.paused = !this.paused;
  }


  handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
        switch (event.key) {
          case 'ArrowUp':
            console.log('up');
            this.setSnakeDirection('up');
            break;
          case 'ArrowDown':
            console.log('down');
            this.setSnakeDirection('down');
            break;
          case 'ArrowLeft':
            console.log('left');
            this.setSnakeDirection('left');
            break;
          case 'ArrowRight':
            console.log('right');
            this.setSnakeDirection('right');
            break;
          case ' ': 
            this.togglePlayPause();
            break
          default:
            // Handle other key presses, if needed
            break;
        }
    }
}


