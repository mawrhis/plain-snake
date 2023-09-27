import { Game } from "./game";
import styles from './page.module.css';

const arena = document.querySelector('#arena')

console.log(arena)

arena?.classList.add(styles.arena);

const game = new Game(arena as HTMLElement);
game.initGame();