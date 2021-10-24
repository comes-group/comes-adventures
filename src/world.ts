import { Player } from "./player";

function rect_intersect(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) {
	if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {
		return false;
	}
	return true;
}

export default class World {
	entities: Array<any> = [];
	player: Player = new Player();
	key_pressed: any = {}

	render(ctx: CanvasRenderingContext2D) {
		this.player.process_key_press(this.key_pressed);
		this.player.process(this);

		ctx.clearRect(0, 0, 800, 600);

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