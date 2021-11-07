import { Sounds } from "./audio_manager";
import { generateRandomDrop, getRandomInt, Vector2 } from "./common";
import Entity, { Direction, EntityType } from "./entity";
import { ItemEntity, ItemInformations } from "./item";
import { world } from "./world";

interface UtilityEntityInfo {
	health: number;
	sprite_src: string;
	drops: { [key: string]: number };
	drop_amount?: number;
}

export const Utilities: { [key: string]: UtilityEntityInfo } = {
	Tree1: {
		health: 220,
		sprite_src: "./textures/Drzewo1.png",
		drops: {
			"Some_Sticks": 1
		},
		drop_amount: 3
	}
};

export class UtilityEntity implements Entity {
	type = EntityType.Utility;
	name = "UTILITY_ENTITY";
	size = new Vector2(32, 32);
	position = new Vector2(0, 0);
	hitbox = new Vector2(32, 32);

	health = 0;
	speed = 0;

	facing = Direction.North;
	uei: UtilityEntityInfo;

	sprite = new Image();

	constructor(uei: UtilityEntityInfo) {
		this.uei = uei;
		this.sprite.src = uei.sprite_src;
		this.health = uei.health;
	}

	damage(amount: number) {
		this.health -= amount;

		if (this.health <= 0) {
			let drop = generateRandomDrop(this.uei.drops);

			for (const item_id of drop) {
				for (const i of Array(getRandomInt(1, this.uei.drop_amount != null ? this.uei.drop_amount : 1))) {
					let item = new ItemEntity(ItemInformations[item_id]);
					item.position = this.position.clone();

					world.add_entity(item);
				}
			}

			world.remove_entity((this as any).id);
		}

		world.audio_man.play_sound(Sounds.OrthoCollarDamage);
	}
	heal() { }

	render(ctx: CanvasRenderingContext2D) {
		ctx.drawImage(this.sprite, this.position.x + ((this.hitbox.x - this.sprite.width) / 2), this.position.y - (this.sprite.height - 32));

		ctx.save();

		ctx.fillStyle = "#ff5757aa";
		ctx.fillRect(this.position.x - 6, this.position.y - 15, 42, 10);

		ctx.fillStyle = "red";
		ctx.fillRect(this.position.x - 6, this.position.y - 15, (this.health / this.uei.health) * 42, 10);

		ctx.restore();
	}
	process() { }
	collides_with() { }
}