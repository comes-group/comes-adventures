import { Vector2 } from "./common";
import Entity, { Direction, EntityType } from "./entity";
import World from "./world";

export class TalkableNPC implements Entity {
	type = EntityType.TalkableNPC;
	name = "TalkableNPC";
	size = new Vector2(32, 32);
	position = new Vector2(0, 0);
	hitbox = new Vector2(32, 32);

	interactable_area = new Vector2(64, 64);

	health = -1;
	facing = Direction.North;

	sprite: HTMLImageElement = new Image();

	constructor() {
		this.sprite.src = "https://cdn.discordapp.com/attachments/635191339859836948/902221013150998608/unknown.png";
	}

	render(ctx: CanvasRenderingContext2D) {
		ctx.drawImage(this.sprite, this.position.x, this.position.y);
	}

	process(world: World) {}
	collides_with() {}
}