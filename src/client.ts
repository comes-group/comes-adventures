import World from "./world";

var isNode = false;

let game_canvas: HTMLCanvasElement = document.getElementById('game-canvas')! as HTMLCanvasElement;
let ctx = game_canvas.getContext('2d');

let world = new World();

import { ItemEntity, ItemInfo, ItemInformations } from "./item";
//world.add_entity(new ItemEntity(ItemInformations["DebugItem"]));
world.add_entity(new ItemEntity(ItemInformations["Dagger"]));

function game_loop() {
	world.render(ctx);
	window.requestAnimationFrame(game_loop);
}

document.body.addEventListener('keydown', (ev) => {
	world.key_pressed[ev.key] = true;
});

document.body.addEventListener('keyup', (ev) => {
	delete world.key_pressed[ev.key];
});

window.requestAnimationFrame(game_loop);