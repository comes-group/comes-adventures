import { Sounds } from "./audio_manager";
import { rect_intersect, Vector2 } from "./common";
import Entity, { Direction, EntityType } from "./entity";
import { world } from "./world";

export interface GenericEnemyInfo {
	health: number;
	damage: number;
	sprite_src: string;
	sight_radius: number;
	attack_radius: number;
	walk_speed: number;

	special_data: any;

	init: (gee: GenericEnemyEntity) => void;
	movement_logic: (gee: GenericEnemyEntity) => void;
	attack_logic: (gee: GenericEnemyEntity) => void;
}

export const GenericEnemies: { [key: string]: GenericEnemyInfo } = {
	OrthoCollar: {
		health: 30,
		damage: 10,
		sprite_src: "https://cdn.discordapp.com/attachments/635191339859836948/903325354658242570/unknown.png",
		sight_radius: 348,
		attack_radius: 72,

		walk_speed: 2,

		special_data: {},

		init: (gee: GenericEnemyEntity) => {
			(gee as any).attack_cooldown = 0;
		},

		movement_logic: (gee: GenericEnemyEntity) => {
			if (gee.position.x > world.player.position.x) {
				gee.position.x -= gee.gei.walk_speed;
				gee.facing = Direction.West;
			} else {
				gee.position.x += gee.gei.walk_speed;
				gee.facing = Direction.East;
			}

			if (gee.position.y > world.player.position.y) {
				gee.position.y -= gee.gei.walk_speed;
				gee.facing = Direction.North;
			} else {
				gee.position.y += gee.gei.walk_speed;
				gee.facing = Direction.South;
			}
		},

		attack_logic: (gee: GenericEnemyEntity) => {
			(gee as any).attack_cooldown += 1;
			if ((gee as any).attack_cooldown > 15) {
				world.player.damage(gee.gei.damage);
				(gee as any).attack_cooldown = 0;
			}
		},
	}
};

export class GenericEnemyEntity implements Entity {
	type = EntityType.GenericEnemy;
	name = "ENEMY_ENTITY";
	size = new Vector2(32, 32);
	position = new Vector2(0, 0);
	hitbox = new Vector2(32, 32);

	health = 50;
	damage_val = 0;

	facing = Direction.North;

	sprite = new Image();
	gei: GenericEnemyInfo;
	speed = 0;

	enable_movement_logic = false;
	enable_attack_logic = false;

	constructor(gei: GenericEnemyInfo) {
		this.health = gei.health;
		this.damage_val = gei.damage;
		this.sprite.src = gei.sprite_src;
		this.speed = gei.walk_speed;
		this.gei = gei;

		gei.init(this);
	}

	damage(amount: number) {
		this.health -= amount;

		if (this.health <= 0) {
			world.remove_entity((this as any).id);
		}

		world.audio_man.play_sound(Sounds.OrthoCollarDamage);
	}
	heal(amount: number) { }

	render(ctx: CanvasRenderingContext2D) {
		ctx.drawImage(this.sprite, this.position.x, this.position.y);

		ctx.save();

		ctx.fillStyle = "#ff5757aa";
		ctx.fillRect(this.position.x - 6, this.position.y - 15, 42, 10);

		ctx.fillStyle = "red";
		ctx.fillRect(this.position.x - 6, this.position.y - 15, (this.health / this.gei.health) * 42, 10);

		ctx.restore();
	}
	process() {
		let sight_area = new Vector2(
			(this.position.x + this.size.x / 2) - this.gei.sight_radius / 2,
			(this.position.y + this.size.y / 2) - this.gei.sight_radius / 2
		);

		let attack_area = new Vector2(
			(this.position.x + this.size.x / 2) - this.gei.attack_radius / 2,
			(this.position.y + this.size.y / 2) - this.gei.attack_radius / 2
		);

		if (rect_intersect(
			sight_area.x,
			sight_area.y,
			this.gei.sight_radius,
			this.gei.sight_radius,
			world.player.position.x,
			world.player.position.y,
			world.player.hitbox.x,
			world.player.hitbox.y
		)) {
			this.enable_movement_logic = true;
		} else {
			this.enable_movement_logic = false;
		}

		if (rect_intersect(
			attack_area.x,
			attack_area.y,
			this.gei.attack_radius,
			this.gei.attack_radius,
			world.player.position.x,
			world.player.position.y,
			world.player.hitbox.x,
			world.player.hitbox.y
		)) {
			this.enable_attack_logic = true;
		} else {
			this.enable_attack_logic = false;
		}
	}

	logic_process() {
		if (this.enable_attack_logic)
			this.gei.attack_logic(this);

		if (this.enable_movement_logic)
			this.gei.movement_logic(this);
	}

	collides_with(entities: Array<Entity>) { }
}