import { rect_intersect, Vector2 } from "./common";
import Entity, { Direction, EntityType } from "./entity";
import World, { world } from "./world";

/*
	Item.ts
	=======

	Here lies all the Item magic which can be used to add more items
	and implement functions for them.

	Every item in game has their own entry in "ItemInformations" object

	Item which want to have some function can provide "implementation"
	member with reference to class. This allows player to make instance of
	specific item implementation and make use of it.

	Adding new items is pretty simple:
		1. Create new entry in "ItemInformations" object
		2. ...
		3. profit?

	"special_info" member can be used for storing some common informations
	for classes of item like melee weapons. They will have practically the
	same implementation but with different values: range, damage etc.

	If item is equippable then it should have some implementation
	as by default will not be rendered. Also there is not any dummy
	item implementation so every item should have one matching it's type.
*/

// Item implementation of Melee weapon
class Item_Weapon_Melee implements ItemImplementation {
	info: ItemInfo;
	sprite: HTMLImageElement = new Image();

	can_be_used: boolean = false;

	init(): void {
		this.sprite.src = this.info.texture_url;

		setInterval(() => {
			this.can_be_used = true;
		}, this.info.special_info.timeout);
	}
	use(): void {
		if(!this.can_be_used)
			return;

		let range = (this.info.special_info.range * 32);

		let attack_area = new Vector2(
			(world.player.position.x + world.player.size.x / 2) - range / 2,
			(world.player.position.y + world.player.size.y / 2) - range / 2
		);

		for (let enemy of world.enemy_entities) {
			if (rect_intersect(
				attack_area.x,
				attack_area.y,
				range,
				range,
				enemy.position.x,
				enemy.position.y,
				enemy.hitbox.x,
				enemy.hitbox.y
			)) {
				enemy.damage(this.info.special_info.damage);
			}
		}

		this.can_be_used = false;
	}
	render(ctx: CanvasRenderingContext2D, position: Vector2): void {
		ctx.drawImage(this.sprite, position.x, position.y);
	}
	process(): void { }
}

// Item category
export enum ItemCategory {
	Invalid,

	Weapon_Melee,
	Utility,

	DEBUG
}

// Equippable slots in player eq
export enum EquippableSlot {
	Invalid,

	WeaponSlot
}

// Defined items
export const ItemInformations: {
	[key: string]: ItemInfo
} = {
	"Dagger": {
		name: "Dagger",
		category: ItemCategory.Weapon_Melee,
		texture_url: "https://cdn.discordapp.com/attachments/403666260832813079/901539954700718080/unknown.png",
		pickable: true,
		equippable: EquippableSlot.WeaponSlot,
		implementation: Item_Weapon_Melee,
		special_info: {
			damage: 5,
			range: 2,
			timeout: 150
		}
	},

	"Minecraft_String": {
		name: "Minecraft String",
		category: ItemCategory.Utility,
		texture_url: "https://cdn.discordapp.com/attachments/635191339859836948/906867166450708500/unknown.png",
		pickable: true
	},

	"DebugItem": {
		name: "DEBUG_ITEM",
		category: ItemCategory.DEBUG,
		texture_url: "https://cdn.discordapp.com/attachments/537743905282719765/866710140663889970/7GG4ies.png",
		pickable: true
	}
};

// Item information for later usage
export interface ItemInfo {
	name: string,
	category: ItemCategory,
	texture_url: string,
	pickable: boolean,
	equippable?: EquippableSlot.WeaponSlot,

	special_info?: any,
	implementation?: any
}

// ItemEntity, used when item is on the ground
// ready to be picked or not, depends on item info
export class ItemEntity implements Entity {
	type = EntityType.Item;
	name = "<DEFAULT ITEM_ENTITY NAME>";
	size = new Vector2(32, 32);
	position = new Vector2(0, 0);
	hitbox = new Vector2(32, 32);
	health = -1;
	facing = Direction.North;
	speed = 0;

	sprite: HTMLImageElement = new Image();
	item_info: ItemInfo;

	constructor(item_info: ItemInfo) {
		this.name = item_info.name;
		this.sprite.src = item_info.texture_url;
		this.item_info = item_info;

		if (!item_info.pickable) {
			this.hitbox = new Vector2(0, 0);
			this.size = new Vector2(0, 0);
		}
	}

	damage() { }
	heal() { }

	render(ctx: CanvasRenderingContext2D) {
		ctx.drawImage(this.sprite, this.position.x, this.position.y);
	}
	process() { }
	collides_with(entities: Array<Entity>) { }
}

// Per item implementation.
// This interface allows items to have unique functions
export interface ItemImplementation {
	info: ItemInfo;

	init(): void;
	use(): void;
	render(ctx: CanvasRenderingContext2D, position: Vector2): void;
	process(): void;
}