import { create_player_collision, rect_intersect, Vector2 } from "./common";
import { Dialog, Dialogs } from "./dialog_manager";
import Entity, { Direction, EntityType } from "./entity";
import { ItemEntity, ItemInformations } from "./item";
import { Quests } from "./quest_manager";
import World, { world } from "./world";

export class TalkableNPC implements Entity {
	type = EntityType.TalkableNPC;
	name = "<DEFAULT TalkableNPC name>";
	size = new Vector2(32, 32);
	private _position = new Vector2(0, 0);
	hitbox = new Vector2(32, 32);

	interactable_area = new Vector2(96, 96);

	pre_calculated_iract_area_pos = new Vector2(
		(this.position.x + this.size.x / 2) - this.interactable_area.x / 2,
		(this.position.y + this.size.y / 2) - this.interactable_area.y / 2
	);

	health = -1;
	facing = Direction.North;
	speed = 0;

	sprite: HTMLImageElement = new Image();

	custom_data: any = {};

	interact_callback: (npc: TalkableNPC) => void;

	constructor(name: string, sprite_src: string, init: (npc: TalkableNPC) => void, interact: (npc: TalkableNPC) => void) {
		this.name = name;
		this.sprite.src = sprite_src;
		this.interact_callback = interact;

		init(this);
	}

	public get position() {
		return this._position;
	}

	public set position(pos: Vector2) {
		this._position = pos;
		this.pre_calculated_iract_area_pos = new Vector2(
			(this.position.x + this.size.x / 2) - this.interactable_area.x / 2,
			(this.position.y + this.size.y / 2) - this.interactable_area.y / 2
		);
	}

	damage() { }
	heal() { }

	render(ctx: CanvasRenderingContext2D) {
		ctx.drawImage(this.sprite, this.position.x, this.position.y);
	}

	process() {
		create_player_collision(world.player, this.position, this.hitbox);

		if (rect_intersect(
			this.pre_calculated_iract_area_pos.x,
			this.pre_calculated_iract_area_pos.y,
			this.interactable_area.x,
			this.interactable_area.y,
			world.player.position.x,
			world.player.position.y,
			world.player.size.x,
			world.player.size.y
		)) {
			world.player.collides_with([this]);
		}

	}

	interact() {
		this.interact_callback(this);
	}

	collides_with() { }
}

export const NPCs: { [key: string]: TalkableNPC } = {
	'Region1_OldMan': new TalkableNPC(
		"Old Man",
		"https://cdn.discordapp.com/attachments/635191339859836948/902221013150998608/unknown.png",
		(npc: TalkableNPC) => {
			npc.custom_data.completed_dialogs = 0;
		},
		(npc: TalkableNPC) => {
			switch (npc.custom_data.completed_dialogs) {
				case 0:
					world.dialog_man.start_dialog(
						Dialogs["Region1_OldMan_WelcomeComes"],
						npc.sprite.src,
						npc.name,
						() => {
							npc.custom_data.completed_dialogs += 1;
							world.quest_man.start_quest(Quests["Region1_GetTheDaggerBoi"]);

							let item = new ItemEntity(ItemInformations["Dagger"]);
							item.position = npc.position.clone();
							item.position.y -= 32;

							world.add_entity(item);
						}
					);
					break;

				default:
					world.dialog_man.start_dialog(
						Dialogs['Region1_OldMan_NothingMoreToSay'],
						npc.sprite.src,
						npc.name
					);
					break;
			}
		}
	),

	'Region2_Blacksmith': new TalkableNPC(
		"Blacksmith",
		"https://cdn.discordapp.com/attachments/635191339859836948/907733399597355068/unknown.png",
		(npc: TalkableNPC) => {
			npc.custom_data.completed_dialogs = 0;
		},
		(npc: TalkableNPC) => {
			switch (npc.custom_data.completed_dialogs) {
				case 0:
					world.dialog_man.start_dialog(
						Dialogs["Region1_Blacksmith_WelcomeComes"],
						npc.sprite.src, npc.name,
						() => {
							npc.custom_data.completed_dialogs += 1;
							world.quest_man.start_quest(Quests["Region1_CollectCalciumAndMinecraftStringForArrowsAndBow"])
						}
					);
					break;

				default:
					world.dialog_man.start_dialog(Dialogs["Region1_Blacksmith_DoYourJob"], npc.sprite.src, npc.name);
					break;
			}
		}
	)
}