import { Vector2 } from "./common";

// Tiled chunk
export class WorldLayerChunk {
	position: Vector2;
	size: Vector2;
	tiles: Array<Array<number>> = [];

	constructor(data: any) {
		this.size = new Vector2(data.width, data.height);
		this.position = new Vector2(data.x, data.y);

		for (let x = 0; x < this.size.x; x++) {
			let yarr: any = [];

			for (let y = 0; y < this.size.y; y++) {
				yarr.push(data.data[x + this.size.y * y]);
			}

			this.tiles.push(yarr);
		}
	}
}

// World layers containing Tiled Chunks
export class WorldLayers {
	tilesize: Vector2 = new Vector2(32, 32);

	collision: Array<WorldLayerChunk> = [];
	floor: Array<WorldLayerChunk> = [];

	tileset: TileSet;

	load_from_data(tileset: TileSet, data: any) {
		this.tileset = tileset;
		this.tilesize = new Vector2(data.tilewidth, data.tileheight);

		for (const layer of data.layers) {
			for (const chunk of layer.chunks) {
				let layer_chunk = new WorldLayerChunk(chunk);

				if (layer.name == "Collision") {
					this.collision.push(layer_chunk);
				}

				if (layer.name == "Floor") {
					this.floor.push(layer_chunk);
				}
			}
		}
	}
}

class Tile {
	id: number;
	image: HTMLImageElement;
}

export class TileSet {
	tilesize: Vector2 = new Vector2(32, 32);
	tiles: Array<Tile> = [];

	load_from_data(data: any) {
		this.tilesize = new Vector2(data.tileheight, data.tilewidth);

		for (const tile of data.tiles) {
			let image = new Image();
			image.src = tile.image;

			this.tiles.push({
				id: tile.id + 1,
				image: image
			});
		}
	}

	get_tile_by_id(id: number) {
		for (const tile of this.tiles) {
			if (tile.id == id) {
				return tile;
			}
		}
	}
}