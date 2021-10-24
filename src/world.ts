import { Vector2 } from "./common";
import { Direction } from "./entity";
import { Player } from "./player";
import { WorldLayerChunk, WorldLayers } from "./world_layers";

function rect_intersect(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) {
	if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {
		return false;
	}
	return true;
}

class Camera {
	position: Vector2 = new Vector2(0, 0);

	start(ctx: CanvasRenderingContext2D) {
		ctx.save();
		ctx.translate(-(this.position.x - ctx.canvas.clientWidth / 2), -(this.position.y - ctx.canvas.clientHeight / 2));
	}

	end(ctx: CanvasRenderingContext2D) {
		ctx.restore();
	}

	check_if_in_bound(ctx: CanvasRenderingContext2D, pos: Vector2, size: Vector2): boolean {
		let x1 = this.position.x - ctx.canvas.clientWidth / 2;
		let y1 = this.position.y - ctx.canvas.clientHeight / 2;

		return rect_intersect(x1, y1, ctx.canvas.clientWidth, ctx.canvas.clientHeight, pos.x, pos.y, size.x, size.y);
	}
}

export default class World {
	entities: Array<any> = [];
	player: Player = new Player();
	key_pressed: any = {};

	camera: Camera = new Camera();
	world_layers: WorldLayers = new WorldLayers();

	constructor() {
		this.player.position.x = 64;
		this.player.position.y = 64;
	}

	load_world_layers(world_layers: WorldLayers) {
		this.world_layers = world_layers;
	}

	render_world_layer(ctx: CanvasRenderingContext2D, layer: Array<WorldLayerChunk>, optional_logic?: any) {
		for (const chunk of layer) {
			let world_chunk_pos = new Vector2(this.world_layers.tilesize.x * chunk.position.x, this.world_layers.tilesize.y * chunk.position.y);

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

	render(ctx: CanvasRenderingContext2D) {
		this.player.process_key_press(this.key_pressed);
		this.player.process(this);

		ctx.clearRect(0, 0, 800, 600);

		this.camera.start(ctx);

		this.render_world_layer(ctx, this.world_layers.collision, (tile_world_x: number, tile_world_y: number) => {
			if (rect_intersect(
				tile_world_x,
				tile_world_y,
				this.world_layers.tilesize.x,
				this.world_layers.tilesize.y,
				this.player.position.x,
				this.player.position.y,
				this.player.hitbox.x,
				this.player.hitbox.y
			)) {
				if (this.player.facing == Direction.West || this.player.side_facing == Direction.West) {
					this.player.position.x += this.player.speed;
				}

				if (this.player.facing == Direction.North) {
					this.player.position.y += this.player.speed;
				}

				if (this.player.facing == Direction.East || this.player.side_facing == Direction.East) {
					this.player.position.x -= this.player.speed;
				}

				if (this.player.facing == Direction.South) {
					this.player.position.y -= this.player.speed;
				}
			}
		});
		this.render_world_layer(ctx, this.world_layers.floor);

		let player_collisions = [];

		for (let entity of this.entities) {
			entity.process(this);

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

			let collisions = [];

			for (let entity2 of this.entities) {
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

			entity.collides_with(this, collisions);
			entity.render(ctx);
		}

		this.player.collides_with(this, player_collisions);
		this.player.render(ctx);

		this.camera.end(ctx);
	}

	add_entity(entity: any) {
		entity.id = this.entities.length + 1;
		this.entities.push(entity);
	}

	remove_entity(entity_id: number) {
		for (let i = 0; i < this.entities.length; i++) {
			const entity = this.entities[i];
			if (entity.id == entity_id) {
				this.entities.splice(i, 1);
			}
		}
	}
}