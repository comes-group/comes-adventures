import { getRandomInt, rect_intersect, Vector2 } from "./common";
import { GenericEnemies, GenericEnemyEntity } from "./enemies";
import Entity, { Direction, EntityType } from "./entity";
import { world } from "./world";

export class EnemySpawner implements Entity {
	type = EntityType.Spawner;
	name = "EnemySpawner";
	size = new Vector2(32, 32);
	position = new Vector2(0, 0);
	hitbox = new Vector2(32, 32);
	health = -1;

	facing = Direction.North;
	speed = 0;

	enemy_type: string;
	enemy_id: string;

	range = 6;

	sprite = new Image();
	enemy_sprite = new Image();

	constructor(enemy_type: string, enemy_id: string) {
		this.sprite.src = "./textures/SPAWNER.png";

		this.enemy_type = enemy_type;
		this.enemy_id = enemy_id;

		if (this.enemy_type == "generic") {
			this.enemy_sprite.src = GenericEnemies[this.enemy_id].sprite_src;
		}

		setInterval(() => {
			let spawn_area = new Vector2(
				(this.position.x + this.size.x / 2) - (this.range * 32) / 2,
				(this.position.y + this.size.y / 2) - (this.range * 32) / 2
			);

			let enemy_count = 0;

			for (const enemy of world.enemy_entities) {
				if (rect_intersect(
					spawn_area.x,
					spawn_area.y,
					(this.range * 32),
					(this.range * 32),
					enemy.position.x,
					enemy.position.y,
					enemy.hitbox.x,
					enemy.hitbox.y,
				)) {
					enemy_count += 1;
				}
			}

			if (enemy_count <= 1) {
				for (const i of Array(getRandomInt(0, 3))) {
					if (this.enemy_type == "generic") {
						let enemy = new GenericEnemyEntity(GenericEnemies[this.enemy_id]);
						enemy.position = new Vector2(
							this.position.x + getRandomInt(-((this.range * 32) / 2),(this.range * 32) / 2),
							this.position.y + getRandomInt(-((this.range * 32) / 2), (this.range * 32) / 2)
						);

						world.add_entity(enemy);
					}
				}
			}
		}, 3000);
	}

	damage() { }
	heal() { }

	render(ctx: CanvasRenderingContext2D) {
		ctx.drawImage(this.sprite, this.position.x, this.position.y);
		ctx.drawImage(this.enemy_sprite, (this.position.x + this.size.x / 2) - 8, (this.position.y + this.size.y / 2) - 8, 16, 16);
	}
	process() { }
	collides_with() { }
}