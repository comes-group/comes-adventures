import { create_player_collision, rect_intersect, Vector2 } from "./common";
import { Direction } from "./entity";
import { Player } from "./player";
import { WorldLayerChunk, WorldLayers } from "./world_layers";
import { Dialog, DialogManager, Dialogs } from "./dialog_manager";
import { QuestManager, Quests } from "./quest_manager";
import { UI } from "./ui";
import { NPCs, TalkableNPC } from "./npc";
import { ItemEntity, ItemInformations } from "./item";

// Wrapper class for manipulating canvas
// making things more like in real game engine
class Camera {
	position: Vector2 = new Vector2(0, 0);

	// Save canvas and change its position
	start(ctx: CanvasRenderingContext2D) {
		ctx.save();
		ctx.translate(-(this.position.x - ctx.canvas.clientWidth / 2), -(this.position.y - ctx.canvas.clientHeight / 2));
	}

	// Restore everything
	end(ctx: CanvasRenderingContext2D) {
		ctx.restore();
	}

	// Check if some rectangle is in viewing space
	// useful for optimizing which elements should be rendered
	check_if_in_bound(ctx: CanvasRenderingContext2D, pos: Vector2, size: Vector2): boolean {
		let x1 = this.position.x - ctx.canvas.clientWidth / 2;
		let y1 = this.position.y - ctx.canvas.clientHeight / 2;

		return rect_intersect(x1, y1, ctx.canvas.clientWidth, ctx.canvas.clientHeight, pos.x, pos.y, size.x, size.y);
	}
}

// World class
export default class World {
	entities: Array<any> = [];
	player: Player;
	key_pressed: any = {};

	global_id_counter = 0;

	camera: Camera = new Camera();
	world_layers: WorldLayers = new WorldLayers();

	dialog_man: DialogManager = new DialogManager();
	quest_man: QuestManager = new QuestManager();

	ui: UI;

	constructor() {}

	init() {
		this.ui = new UI();
		this.player = new Player();

		this.player.position.x = 64;
		this.player.position.y = 64;

		setInterval(() => {
			this.quest_man.process_in_progress_quests();
			this.ui.quests_render();
		}, 1000);
	}

	load_world_layers(world_layers: WorldLayers) {
		this.world_layers = world_layers;

		for (const npc_object of this.world_layers.npcs) {
			let npc = NPCs[npc_object.properties["npc_id"]];
			npc.position = npc_object.position;

			this.add_entity(npc);
		}

		for (const item_object of this.world_layers.items) {
			let item_info = ItemInformations[item_object.properties["item_id"]];
			let item_entity = new ItemEntity(item_info);
			item_entity.position = item_object.position;

			this.add_entity(item_entity);
		}
	}

	// Render single world layer
	// optional_logic allows for using generated tile x and y
	// for some operations like collisions
	render_world_layer(ctx: CanvasRenderingContext2D, layer: Array<WorldLayerChunk>, optional_logic?: any) {
		for (const chunk of layer) {
			let world_chunk_pos = new Vector2(this.world_layers.tilesize.x * chunk.position.x, this.world_layers.tilesize.y * chunk.position.y);

			// Optimize drawing by checking if chunk is in viewing distance
			if (!this.camera.check_if_in_bound(
				ctx, world_chunk_pos,
				new Vector2(
					this.world_layers.tilesize.x * chunk.size.x,
					this.world_layers.tilesize.y * chunk.size.y
				)
			)) {
				continue;
			}

			for (let x = 0; x < chunk.tiles.length; x++) {
				const el = chunk.tiles[x];

				for (let y = 0; y < el.length; y++) {
					const tile_id = el[y];

					if (tile_id == 0) continue;

					let tile = this.world_layers.tileset.get_tile_by_id(tile_id);
					let tile_world_x = world_chunk_pos.x + (this.world_layers.tilesize.x * x);
					let tile_world_y = world_chunk_pos.y + (this.world_layers.tilesize.y * y);

					ctx.drawImage(
						tile.image,
						tile_world_x,
						tile_world_y
					);

					if (optional_logic) optional_logic(tile_world_x, tile_world_y);
				}
			}
		}
	}

	// Render things out
	render(ctx: CanvasRenderingContext2D) {
		// Process player logic
		if (!this.dialog_man.is_in_dialog) {
			this.player.process_key_press(this.key_pressed);
			this.player.process();
		}

		// Clear screen
		ctx.clearRect(0, 0, 800, 600);

		// Start camera work
		this.camera.start(ctx);

		// Render selected world layers
		this.render_world_layer(ctx, this.world_layers.collision, (tile_world_x: number, tile_world_y: number) => {
			create_player_collision(
				this.player,
				new Vector2(tile_world_x, tile_world_y),
				this.world_layers.tilesize
			);
		});
		this.render_world_layer(ctx, this.world_layers.floor);

		// Store players collisions which accured while checking
		let player_collisions = [];

		// Collision detection
		for (let entity of this.entities) {
			if (!this.dialog_man.is_in_dialog)
				entity.process(this);

			// Between player and entity
			if (rect_intersect(
				entity.position.x,
				entity.position.y,
				entity.hitbox.x,
				entity.hitbox.y,
				this.player.position.x,
				this.player.position.y,
				this.player.hitbox.x,
				this.player.hitbox.y
			)) {
				player_collisions.push(entity);
			}

			// Do the same for entities instead of player
			let collisions = [];

			// Between entity and entity
			for (let entity2 of this.entities) {
				if (entity == entity2) continue;

				if (rect_intersect(
					entity.position.x,
					entity.position.y,
					entity.hitbox.x,
					entity.hitbox.y,
					entity2.position.x,
					entity2.position.y,
					entity2.hitbox.x,
					entity2.hitbox.y
				)) {
					collisions.push(entity2);
				}
			}

			// Emit collides_with event to entities
			// and render them
			entity.collides_with(this, collisions);
			entity.render(ctx);
		}

		// Emit collides_with event to player
		// and render them
		this.player.collides_with(player_collisions);
		this.player.render(ctx);

		// End camera work
		this.camera.end(ctx);
	}

	// Add entity to world
	add_entity(entity: any) {
		if (entity.id == undefined) {
			this.global_id_counter += 1;
			entity.id = this.global_id_counter;
		}

		this.entities.push(entity);
	}

	// Remove entity from world
	remove_entity(entity_id: number) {
		for (let i = 0; i < this.entities.length; i++) {
			const entity = this.entities[i];
			if (entity.id == entity_id) {
				this.entities.splice(i, 1);
			}
		}
	}
}

export let world: World = new World();