import { Sounds } from "./audio_manager";
import { generateRandomDrop, getRandomInt, Vector2 } from "./common";
import { Dialogs } from "./dialog_manager";
import Entity, { Direction, EntityType } from "./entity";
import { ItemEntity, ItemInformations } from "./item";
import { world } from "./world";
import { WorldLayerObject } from "./world_layers";

interface UtilityEntityInfo {
	health: number;
	sprite_src: string;
	drops: { [key: string]: number };
	damagable: boolean,
	pure_functional: boolean,
	drop_amount?: number;

	on_init?: (ue: UtilityEntity) => void,
	on_collision?: (ue: UtilityEntity, entities: Array<Entity>) => void,
	on_render?: (ue: UtilityEntity, ctx: CanvasRenderingContext2D) => void,
	on_process?: (ue: UtilityEntity) => void,
}

export const Utilities: { [key: string]: UtilityEntityInfo } = {
	Tree1: {
		health: 220,
		sprite_src: "./textures/Drzewo1.png",
		drops: {
			"Some_Sticks": 1
		},
		drop_amount: 3,
		damagable: true,
		pure_functional: false
	},

	Teleport: {
		health: -1,
		sprite_src: "./textures/UŻYTECZNE/Teleport.png",
		drops: {},
		damagable: false,
		pure_functional: true,

		on_collision: (ue, entities) => {
			for (const entity of entities) {
				if (entity.type != EntityType.Player)
					continue;

				let needs_interaction = ue.worldlayer_object.properties["needs_interaction"];
				let position_to_tp = world.world_layers.get_object_by_id(
					ue.worldlayer_object.properties["destination"]
				);

				if (needs_interaction) {
					world.player.request_npc_interaction("Teleport", () => {
						world.player.position = position_to_tp.position;
						world.remove_entity((ue as any).id);
					});
				} else {
					world.player.position = position_to_tp.position;
					world.remove_entity((ue as any).id);
				}
			}
		}
	},

	PlayerSpawn: {
		health: 220,
		sprite_src: "./textures/UŻYTECZNE/PlayerSpawn.png",
		drops: {},
		damagable: false,
		pure_functional: true,

		on_process: (ue: UtilityEntity) => {
			world.player.position = ue.position;
			world.remove_entity((ue as any).id);
		},

		on_render: () => { }
	},

	PositionMark: {
		health: 220,
		sprite_src: "./textures/UŻYTECZNE/PositionMarker.png",
		drops: {},
		damagable: false,
		pure_functional: true,

		on_render: () => { }
	},

	DialogExecute: {
		health: -1,
		sprite_src: "./textures/UŻYTECZNE/DialogExecute.png",
		drops: {},
		damagable: false,
		pure_functional: true,

		on_render: (ue, ctx) => {
			if (ue.worldlayer_object.visible) {
				ctx.drawImage(
					ue.sprite,
					ue.position.x + ((ue.hitbox.x - ue.sprite.width) / 2),
					ue.position.y - (ue.sprite.height - 32)
				);
			}
		},

		on_collision: (ue, entities) => {
			for (const entity of entities) {
				if (entity.type != EntityType.Player)
					continue;

				let message = ue.worldlayer_object.properties["message"];

				world.player.request_npc_interaction(message, () => {
					world.dialog_man.start_dialog(
						Dialogs[ue.worldlayer_object.properties["dialog_id"]],
						"",
						message
					);
				});
			}
		}
	},

	/*
		{
			speed: this.info.special_info.speed,
			damage: this.info.special_info.damage,
			range: this.info.special_info.range,
			item: this.info.special_info.uses,
			direction: world.player.facing
		}
	*/

	Projectile: {
		health: -1,
		sprite_src: "",
		drops: {},
		damagable: false,
		pure_functional: true,

		on_init: (ue) => {
			(ue as any).travelled_distance = 0
			ue.sprite.src = ItemInformations[ue.special_data.item].texture_url;

			setInterval(() => {
				(ue as any).can_make_damage = true;
			}, 50);
		},

		on_collision: (ue, entities) => {
			if ((ue as any).can_make_damage) {
				for (const entity of entities) {
					if (entity.type == EntityType.GenericEnemy) {
						entity.damage(ue.special_data.damage);
					}
				}

				(ue as any).can_make_damage = false;
			}
		},

		on_render: (ue: UtilityEntity, ctx) => {
			ctx.drawImage(
				ue.sprite,
				ue.position.x + ((ue.hitbox.x - ue.sprite.width) / 2),
				ue.position.y - (ue.sprite.height - 32)
			);

			if (ue.special_data.direction == Direction.North) {
				ue.position.y -= ue.special_data.speed;
			} else if (ue.special_data.direction == Direction.South) {
				ue.position.y += ue.special_data.speed;
			} else if (ue.special_data.direction == Direction.West) {
				ue.position.x -= ue.special_data.speed;
			} else if (ue.special_data.direction == Direction.East) {
				ue.position.x += ue.special_data.speed;
			}
		},

		on_process: (ue) => {
			if ((ue as any).travelled_distance * 32 >= ue.special_data.range * 32) {
				world.remove_entity((ue as any).id)

				let item_entity = new ItemEntity(ItemInformations[ue.special_data.item]);
				item_entity.position = ue.position.clone();
				world.add_entity(item_entity);
			}

			(ue as any).travelled_distance += ue.special_data.speed;
		}
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
	special_data: any;

	sprite = new Image();

	worldlayer_object: null | WorldLayerObject;

	constructor(uei: UtilityEntityInfo, worldlayer_object: WorldLayerObject = null, special_data: any = {}) {
		this.uei = uei;
		this.sprite.src = uei.sprite_src;
		this.health = uei.health;
		this.special_data = special_data;

		this.worldlayer_object = worldlayer_object;

		if (this.uei.on_init)
			this.uei.on_init(this);
	}

	damage(amount: number) {
		if (!this.uei.damagable)
			return;

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
		if (this.uei.on_render) {
			this.uei.on_render(this, ctx);
			return;
		}

		ctx.drawImage(this.sprite, this.position.x + ((this.hitbox.x - this.sprite.width) / 2), this.position.y - (this.sprite.height - 32));

		if (this.uei.damagable) {
			ctx.save();

			ctx.fillStyle = "#ff5757aa";
			ctx.fillRect(this.position.x - 6, this.position.y - 15, 42, 10);

			ctx.fillStyle = "red";
			ctx.fillRect(this.position.x - 6, this.position.y - 15, (this.health / this.uei.health) * 42, 10);

			ctx.restore();
		}
	}
	process() {
		if (this.uei.on_process)
			this.uei.on_process(this);
	}
	collides_with(entities: Array<Entity>) {
		if (this.uei.on_collision)
			this.uei.on_collision(this, entities);
	}
}