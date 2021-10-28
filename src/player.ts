import Entity, { Direction, DirToRot, EntityType } from "./entity";
import World, { world } from "./world";
import { ItemEntity, ItemInfo, EquippableSlot, ItemImplementation } from "./item";
import { Vector2 } from "./common";
import { TalkableNPC } from "./npc";

// Renderable player, intended for future multiplayer
export class RenderablePlayer implements Entity {
	// Name, type and facing
	name = 'renderable_player';
	type = EntityType.GenericRenderable;
	facing = Direction.North;

	size = new Vector2(32, 32);
	position = new Vector2(0, 0);
	hitbox = new Vector2(32, 32);
	health = -1;

	sprite: HTMLImageElement = new Image();

	render(ctx: CanvasRenderingContext2D) {
		ctx.drawImage(this.sprite, this.position.x, this.position.y);
	}
	process() { }
	collides_with(entities: Array<Entity>) { }
};

// Item in player equipment
// represents UI element and item itself
export class ItemInPlayerEq {
	id: number;
	el: HTMLElement;
	info: ItemInfo;
	is_equipped: boolean;
}

export class Player extends RenderablePlayer {
	name = 'player';
	type = EntityType.Player;
	speed: number = 3;
	running_speed: number = 5;

	health = 100;
	mana = 100;

	// Which side is player also facing
	side_facing: Direction = Direction.North;

	// Class memebers for storing equipment
	is_eq_open: boolean = false;
	eq_items_inside: Array<ItemInPlayerEq> = [];
	eq_item_inside_index_counter = 0;
	eq_items_equippable_slots: Record<EquippableSlot, null | ItemInPlayerEq>;
	eq_items_equippable_implementations: Record<EquippableSlot, null | ItemImplementation>;

	constructor() {
		super();

		// Create containers so js will stay stable
		this.eq_items_equippable_slots = {} as Record<EquippableSlot, null | ItemInPlayerEq>;
		this.eq_items_equippable_implementations = {} as Record<EquippableSlot, null | ItemImplementation>;

		// Null-out empty slots
		this.eq_items_equippable_slots[EquippableSlot.WeaponSlot] = null;
		this.eq_items_equippable_implementations[EquippableSlot.WeaponSlot] = null;

		// Draw equipped items ui
		world.ui.eq_redraw(this);

		// Source to player sprite
		this.sprite.src = "https://cdn.discordapp.com/attachments/403666260832813079/901526304304816228/unknown.png";
	}

	get_item_by_id(id: number): null | ItemInPlayerEq {
		for (const item of this.eq_items_inside) {
			if (item.id == id) {
				return item;
			}
		}

		return null;
	}

	// Add item to equipment
	// both UI and internal
	// returns item id
	add_item_to_eq(item: ItemInfo): number {
		this.eq_item_inside_index_counter += 1;

		// Create ItemInPLayerEq objetct
		let ni: ItemInPlayerEq = new ItemInPlayerEq;
		// Assign id, info, HTMLElement and is_equipped flag
		ni.id = this.eq_item_inside_index_counter;
		ni.info = item;
		ni.el = world.ui.eq_create_item_element(this, ni, `EQ-LIST-ITEM--${ni.id}`);
		ni.is_equipped = false;

		// Check if item can be equipped
		// if so, then add "Equip" button
		if (item.equippable) {
			let equip_btn = document.createElement("button");
			equip_btn.innerText = "Equip";
			// Equip item event
			equip_btn.onclick = () => this.equip_item_to_slot(item.equippable, ni);

			ni.el.appendChild(equip_btn);
		}

		// Add item to UI
		world.ui.eq_add_item_element(ni.el);
		// Add item to internal container
		this.eq_items_inside.push(ni);

		return ni.id;
	}

	// Add item to equipment
	// but use colliding ItemEntity to pickup
	// item from the ground
	add_item_to_eq_by_ItemEntity(item: ItemEntity) {
		this.add_item_to_eq(item.item_info);
	}

	// Removes item from equimpment
	// both UI and internal
	remove_item_from_eq(item: ItemInPlayerEq) {
		// Check if item is equipped
		// if so, then remove it from UI
		if (item.is_equipped) {
			item.el.parentElement.removeChild(item.el);
			return;
		}

		for (let i = 0; i < this.eq_items_inside.length; i++) {
			const el = this.eq_items_inside[i];

			if (el.id == item.id) {
				// Remove item from internal container
				// and from UI
				this.eq_items_inside.splice(i, 1);
				item.el.parentElement.removeChild(item.el);
			}
		}
	}

	// Drop item from equippment to ground
	drop_item_from_eq(item: ItemInPlayerEq) {
		this.remove_item_from_eq(item);

		let ientity = new ItemEntity(item.info);
		ientity.position.x = this.position.x;
		ientity.position.y = this.position.y;

		world.add_entity(ientity);
	}

	// Equip item to selected slot
	equip_item_to_slot(slot: EquippableSlot, item: ItemInPlayerEq) {
		if(this.eq_items_equippable_slots[slot] != null) {
			this.unequip_item_from_slot(slot);
		}

		this.eq_items_equippable_slots[slot] = item;
		this.remove_item_from_eq(item);
		item.is_equipped = true;

		if (item.info.implementation) {
			// Create new instance of selected item implementation
			// Assign info from selected item
			// Init implementation
			this.eq_items_equippable_implementations[item.info.equippable!] = new item.info.implementation();
			this.eq_items_equippable_implementations[item.info.equippable!].info = item.info;
			this.eq_items_equippable_implementations[item.info.equippable!].init();
		}

		// Redraw HTML equipped ui
		world.ui.eq_redraw(this);
	}

	// Unequip item from slot
	// returns id of new item, otherwise -1
	unequip_item_from_slot(slot: EquippableSlot): number {
		// If slot is eqipped
		if (this.eq_items_equippable_slots[slot] != null) {
			// Add to standard equipment previously equipped item
			let new_item_id = this.add_item_to_eq(this.eq_items_equippable_slots[slot].info);
			// Remove implementation
			delete this.eq_items_equippable_implementations[this.eq_items_equippable_slots[slot].info.equippable!];
			this.eq_items_equippable_implementations[this.eq_items_equippable_slots[slot].info.equippable!] = null;
			// Clear slot
			this.eq_items_equippable_slots[slot] = null;
			// Redraw UI
			world.ui.eq_redraw(this);

			return new_item_id;
		}
	}

	// Process key press event
	process_key_press(key_pressed: any) {
		// W - Forward
		if (key_pressed["w"]) {
			this.position.y -= this.speed;
			this.facing = Direction.North;
			// S - Backwards
		} else if (key_pressed["s"]) {
			this.position.y += this.speed;
			this.facing = Direction.South;
		}

		// A - Left
		if (key_pressed["a"]) {
			this.position.x -= this.speed;

			// Check if Forward/Backwards is pressed
			// if so, then use side_facing instead of normal one
			if (key_pressed["w"] || key_pressed["s"]) {
				this.side_facing = Direction.West;
			} else {
				this.facing = Direction.West;
			}
			// D - Right
		} else if (key_pressed["d"]) {
			this.position.x += this.speed;

			// Check if Forward/Backwards is pressed
			// if so, then use side_facing instead of normal one
			if (key_pressed["w"] || key_pressed["s"]) {
				this.side_facing = Direction.East;
			} else {
				this.facing = Direction.East;
			}
		} else {
			this.side_facing = Direction.North;
		}

		// Open inventory
		if (key_pressed["i"]) {
			this.is_eq_open = !this.is_eq_open;
		}

		// Running
		if (key_pressed["shift"]) {
			this.speed = this.running_speed;
		} else {
			this.speed = 3;
		}
	}

	render(ctx: CanvasRenderingContext2D) {
		ctx.save();

		// Do some translate magic to make player
		// rotate certain way
		ctx.translate(this.position.x, this.position.y);
		ctx.translate(this.size.x / 2, this.size.y / 2);
		ctx.rotate(DirToRot(this.facing) * Math.PI / 180);
		ctx.translate(-this.size.x / 2, -this.size.y / 2);

		// Draw sprite
		ctx.drawImage(this.sprite, 0, 0);

		// Render every not null instance of item implementation
		for (const k of Object.keys(this.eq_items_equippable_implementations)) {
			let impl = this.eq_items_equippable_implementations[k as undefined as EquippableSlot];

			if (impl == null) continue;

			impl.render(ctx, new Vector2(0, -12));
		}

		ctx.restore();
	}

	process() {
		world.ui.item_pick_dialog_visibility(false);
		world.ui.npc_interaction_dialog_visibility(false);

		world.ui.eq_visibility(this.is_eq_open);

		// Do the same as above in render(ctx) but with process(world)
		for (const k of Object.keys(this.eq_items_equippable_implementations)) {
			let impl = this.eq_items_equippable_implementations[k as undefined as EquippableSlot];

			if (impl == null) continue;

			impl.process();
		}

		// Set camera position to player
		world.camera.position = this.position;
	}

	// Handle collisions
	collides_with(entities: Array<Entity>) {
		for (let entity of entities) {
			// If entity is ItemEntity then
			// show pickup dialog and eventually
			// add this item to equipment
			if (entity.type == EntityType.Item) {
				let item_entity = entity as ItemEntity;

				if (!item_entity.item_info.pickable) {
					continue;
				}

				world.ui.item_pick_dialog_visibility(true);
				world.ui.item_pick_dialog_add_item_name(item_entity.item_info.name);

				if (world.key_pressed["e"]) {
					this.add_item_to_eq_by_ItemEntity(item_entity);
					world.remove_entity((item_entity as any).id);
				}
			}

			if (entity.type == EntityType.TalkableNPC) {
				let talkable_npc = entity as TalkableNPC;

				world.ui.npc_interaction_dialog_visibility(true);
				world.ui.npc_interaction_dialog_set_npc_name(talkable_npc.name);

				if (world.key_pressed["f"]) {
					talkable_npc.interact();
				}
			}
		}
	}
}