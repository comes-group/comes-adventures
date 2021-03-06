import { create_player_collision, Vector2 } from "./common";
import { Dialogs } from "./dialog_manager";
import Entity, { Direction, EntityType } from "./entity";
import { ItemInformations } from "./item";
import { Quests } from "./quest_manager";
import { world } from "./world";

interface SecurityGateInfo {
	can_be_removed(sge: SecurityGateEntity): boolean;
}

export const SecurityGates: { [key: string]: SecurityGateInfo } = {
	Region1_BlockBeforeTheDagger: {
		can_be_removed: (sge: SecurityGateEntity) => {
			return world.quest_man.completed.includes(Quests["Region1_GetTheDaggerBoi"]);
		}
	},

	Region1_BlockBeforeSpiderAndOrthoSpawners: {
		can_be_removed: (sge: SecurityGateEntity) => {
			return world.quest_man.completed.includes(Quests["Region1_GetTheDaggerBoi"]);
		}
	},

	Region1_BlockBeforePathToTheCity: {
		can_be_removed: (sge: SecurityGateEntity) => {
			return world.player.eq_has_item(ItemInformations["PoorManBow"], 1);
		}
	}
};

export class SecurityGateEntity implements Entity {
	id: number;

	type = EntityType.SecurityGate;
	name = "Security_Gate";
	size = new Vector2(32, 32);
	position = new Vector2(0, 0);
	hitbox = new Vector2(32, 32);

	health = -1;
	facing = Direction.North;
	speed = 0;

	sprite = new Image();

	sgi: SecurityGateInfo;

	constructor(sgi: SecurityGateInfo, size: Vector2, position: Vector2, sprite_src: string) {
		this.sprite.src = sprite_src;
		this.sgi = sgi;
		this.size = size;
		this.hitbox = size;
		this.position = new Vector2(position.x, (position.y - this.size.y) + 32);
	}

	damage() {}
	heal() {}

	render(ctx: CanvasRenderingContext2D) {
		ctx.drawImage(this.sprite, this.position.x, this.position.y, this.size.x, this.size.y);
	}
	process() {
		if (this.sgi.can_be_removed(this)) {
			world.remove_entity(this.id);
		}
	}
	collides_with(entities: Array<Entity>) {
		create_player_collision(world.player, this.position, this.hitbox, () => {
			world.dialog_man.start_dialog(
				Dialogs["Region1_Gate_HackingToTheGate"],
				"https://cdn.discordapp.com/attachments/403666260832813079/901526304304816228/unknown.png",
				"GATE OF STEINER"
			);
		});
	}
}