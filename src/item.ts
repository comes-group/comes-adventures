import { Vector2 } from "./common";
import Entity, { Direction, EntityType } from "./entity";
import World from "./world";

class Item_Weapon_Melee implements ItemImplementation {
	info: ItemInfo;
	sprite: HTMLImageElement = new Image();

	init(): void {
		this.sprite.src = this.info.texture_url;
	}
	use(world: World): void {}
	render(ctx: CanvasRenderingContext2D, position: Vector2): void {
		ctx.drawImage(this.sprite, position.x, position.y);
	}
	process(world: World): void {}
}

export enum ItemCategory {
	Invalid,

	Weapon_Melee,
	DEBUG
}

export enum EquippableSlot {
	Invalid,

	WeaponSlot
}

export const ItemInformations: {
	[key: string]: ItemInfo
} = {
	"Dagger": {
		name: "Dagger",
		category: ItemCategory.Weapon_Melee,
		texture_url: "https://cdn.discordapp.com/attachments/403666260832813079/901539954700718080/unknown.png",
		pickable: true,
		equippable: EquippableSlot.WeaponSlot,
		implementation: Item_Weapon_Melee
	},

	"DebugItem": {
		name: "DEBUG_ITEM",
		category: ItemCategory.DEBUG,
		texture_url: "https://cdn.discordapp.com/attachments/537743905282719765/866710140663889970/7GG4ies.png",
		pickable: true
	}
};

export interface ItemInfo {
	name: string,
	category: ItemCategory,
	texture_url: string,
	pickable: boolean,
	equippable?: EquippableSlot.WeaponSlot,

	special_info?: any,
	implementation?: any
}

export class ItemEntity implements Entity {
	type = EntityType.Item;
	name = "<DEFAULT ITEM_ENTITY NAME>";
	size = new Vector2(32, 32);
	position = new Vector2(0, 0);
	hitbox = new Vector2(32, 32);
	health = -1;
	facing = Direction.North;

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

	render(ctx: CanvasRenderingContext2D) {
		ctx.drawImage(this.sprite, this.position.x, this.position.y);
	}
	process(world: World) { }
	collides_with(world: World, entities: Array<Entity>) { }
}

export interface ItemImplementation {
	info: ItemInfo;

	init(): void;
	use(world: World): void;
	render(ctx: CanvasRenderingContext2D, position: Vector2): void;
	process(world: World): void;
}