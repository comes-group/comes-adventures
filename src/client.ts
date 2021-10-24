import World from "./world";
import { ItemEntity, ItemInfo, ItemInformations } from "./item";
import { WorldLayers, TileSet } from "./world_layers";

import world1_tileset from "../ComesAdventureWorld1-Tileset.json";
import world1_map from "../ComesAdventureWorld1-Map.json";

var isNode = false;

let game_canvas: HTMLCanvasElement = document.getElementById('game-canvas')! as HTMLCanvasElement;
let ctx = game_canvas.getContext('2d');

let world = new World();

let tileset = new TileSet();
let world_layers = new WorldLayers();

tileset.load_from_data(world1_tileset);
world_layers.load_from_data(tileset, world1_map);

world.load_world_layers(world_layers);

//world.add_entity(new ItemEntity(ItemInformations["DebugItem"]));
world.add_entity(new ItemEntity(ItemInformations["Dagger"]));

function game_loop() {
	world.render(ctx);
	window.requestAnimationFrame(game_loop);
}

document.body.addEventListener('keydown', (ev) => {
	world.key_pressed[ev.key.toLowerCase()] = true;
});

document.body.addEventListener('keyup', (ev) => {
	delete world.key_pressed[ev.key.toLowerCase()];
});

document.body.querySelector("#ui-save-button").addEventListener('click', (ev) => {
	console.log(JSON.stringify(world.player.eq_items_inside));
});

window.requestAnimationFrame(game_loop);