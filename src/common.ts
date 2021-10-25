import { Direction } from "./entity";
import { Player } from "./player";

export class Vector2 {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
}

// Check if two rectangles intersect
export function rect_intersect(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) {
	if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {
		return false;
	}
	return true;
}

export function create_player_collision(player: Player, rect_pos: Vector2, rect_size: Vector2) {
	if (rect_intersect(
		rect_pos.x,
		rect_pos.y,
		rect_size.x,
		rect_size.y,
		player.position.x,
		player.position.y,
		player.hitbox.x,
		player.hitbox.y
	)) {
		if (player.facing == Direction.West || player.side_facing == Direction.West) {
			player.position.x += player.speed;
		}

		if (player.facing == Direction.North) {
			player.position.y += player.speed;
		}

		if (player.facing == Direction.East || player.side_facing == Direction.East) {
			player.position.x -= player.speed;
		}

		if (player.facing == Direction.South) {
			player.position.y -= player.speed;
		}
	}
}