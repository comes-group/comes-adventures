import World from "./world";
import { Vector2 } from "./common";

// Entity type
export enum EntityType {
	Player,
	GenericRenderable,
	TalkableNPC,
	SecurityGate,

	GenericEnemy,

	Item
};

// Direction
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
	speed: number,

	damage(amount: number): void;
	heal(amount: number): void;

	render(ctx: CanvasRenderingContext2D): void;
	process(): void;
	collides_with(entities: Array<Entity>): void;
}