# plain-snake
Plain snake is a open-ended exploration of classical snake game. It's a playground type of development.

## use

```html
<div id='arena'></div>
```

```javascript
const arena = document.querySelector('#arena')

const game = new Game(arena as HTMLElement);
game.initGame();
```

## TODO
- configuration - go through walls
- configuration - color theme