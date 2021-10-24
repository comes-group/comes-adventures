import World from "./world";
import { Vector2 } from "./common";

export enum EntityType {
	Player,
	GenericRenderable,
	Item
};

export enum Direction {
	West = 3,
	North = 0,
	East = 1,
	South = 2
}

export function DirToRot(direction: Direction): number {
	return direction * 90;
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