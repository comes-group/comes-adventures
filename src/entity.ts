import World from "./world";
import { Vector2 } from "./common";

export enum EntityType {
	Player,
	GenericRenderable,
	Item
};

export enum Direction {
	West = 1 << 0,
	North = 1 << 1,
	East = 1 << 2,
	South = 1 << 3
}

export function DirToRot(direction: Direction): number {
	if (direction == Direction.West) {
		return -90;
	} else if (direction == Direction.North) {
		return 0;
	} else if (direction == Direction.East) {
		return 90;
	} else if (direction == Direction.South) {
		return 180;
	}
}

export default interface Entity {
	type: EntityType,
	name: string,
	size: Vector2,
	position: Vector2,
	hitbox: Vector2,
	health: number,
	facing: Direction,

	render(ctx: CanvasRenderingContext2D): void;
	process(world: World): void;
	collides_with(world: World, entities: Array<Entity>): void;
}