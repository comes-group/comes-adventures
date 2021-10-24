import Entity, { Direction, DirToRot, EntityType } from "./entity";
import World from "./world";
import { ItemEntity, ItemInfo, EquippableSlot, ItemImplementation } from "./item";
import { Vector2 } from "./common";

export class RenderablePlayer implements Entity {
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
	process(world: World) { }
	collides_with(world: World, entities: Array<Entity>) { }
};

class ItemInPlayerEq {
	id: number;
	el: HTMLElement;
	info: ItemInfo;
	is_equipped: boolean;
}

export class Player extends RenderablePlayer {
	name = 'player';
	type = EntityType.Player;
	speed: number = 3;
	health = 100;

	ui_item_pick = document.getElementById('item-pick-dialog')
	ui_player_equipment = document.getElementById('player-equipment');
	ui_player_equipped_slots = document.getElementById('player-equipment').querySelectorAll(".scroll .player-info .equipped")[0];

	is_eq_open: boolean = false;
	eq_items_inside: Array<ItemInPlayerEq> = [];
	eq_items_equippable_slots: Record<EquippableSlot, null | ItemInPlayerEq>;
	eq_items_equippable_implementations: Record<EquippableSlot, null | ItemImplementation>;

	world: World;

	constructor() {
		super();

		this.eq_items_equippable_slots = {} as Record<EquippableSlot, null | ItemInPlayerEq>;
		this.eq_items_equippable_implementations = {} as Record<EquippableSlot, null | ItemImplementation>;

		this.eq_items_equippable_slots[EquippableSlot.WeaponSlot] = null;
		this.eq_items_equippable_implementations[EquippableSlot.WeaponSlot] = null;

		this.redraw_equipped_ui();

		this.sprite.src = "https://cdn.discordapp.com/attachments/403666260832813079/901526304304816228/unknown.png";
	}

	ui_item_create(item: ItemInPlayerEq, id: string): HTMLElement {
		let el = document.createElement("div");
		el.classList.add("item-in-eq");

		el.innerHTML = `
			<img src="${item.info.texture_url}" alt="">
			<span>${item.info.name}</span>
			<span></span>
		`;

		el.id = id;

		let drop_btn = document.createElement("button");
		drop_btn.innerText = "Drop";
		drop_btn.onclick = () => this.drop_item_from_eq(item);
		el.appendChild(drop_btn);

		return el;
	}

	add_item_to_eq(item: ItemInfo) {
		let ni: ItemInPlayerEq = new ItemInPlayerEq;
		ni.id = this.eq_items_inside.length + 1;
		ni.info = item;
		ni.el = this.ui_item_create(ni, `EQ-LIST-ITEM--${ni.id}`);
		ni.is_equipped = false;

		if (item.equippable) {
			let equip_btn = document.createElement("button");
			equip_btn.innerText = "Equip";
			equip_btn.onclick = () => this.equip_item_to_slot(item.equippable, ni);

			ni.el.appendChild(equip_btn);
		}

		this.ui_player_equipment.querySelectorAll(".scroll")[0].appendChild(ni.el);
		this.eq_items_inside.push(ni)
	}

	add_item_to_eq_by_ItemEntity(item: ItemEntity) {
		this.add_item_to_eq(item.item_info);
	}

	remove_item_from_eq(item: ItemInPlayerEq) {
		if (item.is_equipped) {
			item.el.parentElement.removeChild(item.el);
			return;
		}

		for (let i = 0; i < this.eq_items_inside.length; i++) {
			const el = this.eq_items_inside[i];

			if (el.id == item.id) {
				this.eq_items_inside.splice(i, 1);
				item.el.parentElement.removeChild(item.el);
			}
		}
	}

	drop_item_from_eq(item: ItemInPlayerEq) {
		this.remove_item_from_eq(item);

		let ientity = new ItemEntity(item.info);
		ientity.position.x = this.position.x;
		ientity.position.y = this.position.y;

		this.world.add_entity(ientity);
	}

	equip_item_to_slot(slot: EquippableSlot, item: ItemInPlayerEq) {
		this.eq_items_equippable_slots[slot] = item;
		this.remove_item_from_eq(item);
		item.is_equipped = true;

		if (item.info.implementation) {
			this.eq_items_equippable_implementations[item.info.equippable!] = new item.info.implementation();
			this.eq_items_equippable_implementations[item.info.equippable!].info = item.info;
			this.eq_items_equippable_implementations[item.info.equippable!].init();
		}

		this.redraw_equipped_ui();
	}

	unequip_item_from_slot(slot: EquippableSlot) {
		if (this.eq_items_equippable_slots[slot] != null) {
			this.add_item_to_eq(this.eq_items_equippable_slots[slot].info);
			this.eq_items_equippable_slots[slot] = null;
			this.redraw_equipped_ui();
		}
	}

	redraw_equipped_ui() {
		this.ui_player_equipped_slots.innerHTML = "";

		for (const k of Object.keys(this.eq_items_equippable_slots)) {
			const key = (k as unknown as EquippableSlot);

			if (key == EquippableSlot.WeaponSlot) {
				let b = document.createElement("b");
				b.innerText = "Weapon:";
				this.ui_player_equipped_slots.appendChild(b);

				if (this.eq_items_equippable_slots[key] != null) {
					let el = this.ui_item_create(this.eq_items_equippable_slots[key], `EQ-EQUIPPED-IN-SLOT--${key}`);
					let unequip_btn = document.createElement("button");

					unequip_btn.innerText = "Unequip";
					unequip_btn.onclick = () => this.unequip_item_from_slot(key);

					el.appendChild(unequip_btn);
					this.ui_player_equipped_slots.appendChild(el);
					this.eq_items_equippable_slots[key].el = el;
				}

				this.ui_player_equipped_slots.appendChild(document.createElement("br"))
			}
		}
	}

	process_key_press(key_pressed: any) {
		if (key_pressed["w"]) {
			this.position.y -= this.speed;
			this.facing = Direction.North;
		}
		if (key_pressed["s"]) {
			this.position.y += this.speed;
			this.facing = Direction.South;
		}
		if (key_pressed["a"]) {
			this.position.x -= this.speed;
			this.facing = Direction.West;
		}
		if (key_pressed["d"]) {
			this.position.x += this.speed;
			this.facing = Direction.East;
		}

		if (key_pressed["i"]) {
			this.is_eq_open = !this.is_eq_open;
		}
	}

render(ctx: CanvasRenderingContext2D) {
	ctx.save();

	ctx.translate(this.position.x, this.position.y);
	ctx.translate(this.size.x / 2, this.size.y / 2);
	ctx.rotate(DirToRot(this.facing) * Math.PI / 180);
	ctx.translate(-this.size.x / 2, -this.size.y / 2);

	ctx.drawImage(this.sprite, 0, 0);

	for (const k of Object.keys(this.eq_items_equippable_implementations)) {
		let impl = this.eq_items_equippable_implementations[k as undefined as EquippableSlot];

		if (impl == null) continue;

		impl.render(ctx, new Vector2(0, -12));
	}

	ctx.restore();
}

	process(world: World) {
		this.ui_item_pick.style.display = "none";
		this.ui_item_pick.querySelectorAll("ul")[0].innerHTML = "";

		if (!this.is_eq_open) {
			this.ui_player_equipment.style.display = "none";
		} else {
			this.ui_player_equipment.style.display = "flex";
		}

		for (const k of Object.keys(this.eq_items_equippable_implementations)) {
			let impl = this.eq_items_equippable_implementations[k as undefined as EquippableSlot];

			if (impl == null) continue;

			impl.process(world);
		}

		this.world = world;
	}

	collides_with(world: World, entities: Array<Entity>) {
		for (let entity of entities) {
			if (entity.type == EntityType.Item) {
				let item_entity = entity as ItemEntity;

				if (!item_entity.item_info.pickable) {
					continue;
				}

				this.ui_item_pick.style.display = "block";
				this.ui_item_pick.querySelectorAll("ul")[0].innerHTML += `<li>${item_entity.item_info.name}</li>`;

				if (world.key_pressed["e"]) {
					this.add_item_to_eq_by_ItemEntity(item_entity);
					world.remove_entity((item_entity as any).id);
				}
			}
		}
	}
}