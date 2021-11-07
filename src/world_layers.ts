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

export class WorldLayerObject {
	position: Vector2;
	size: Vector2;
	properties: { [key: string]: any } = {};
	tile_id: number;

	constructor(data: any) {
		this.position = new Vector2(data.x, data.y);
		this.size = new Vector2(data.width, data.height);
		this.tile_id = data.gid;

		if(data.properties == null)
			return;

		for (const property of data.properties) {
			this.properties[property.name] = property.value;
		}
	}
}

// World layers containing Tiled Chunks
export class WorldLayers {
	tilesize: Vector2 = new Vector2(32, 32);

	gates: Array<WorldLayerObject> = [];
	spawners: Array<WorldLayerObject> = [];
	items: Array<WorldLayerObject> = [];
	npcs: Array<WorldLayerObject> = [];
	enemies: Array<WorldLayerObject> = [];

	collision: Array<WorldLayerChunk> = [];
	floor: Array<WorldLayerChunk> = [];

	tileset: TileSet;

	load_from_data(tileset: TileSet, data: any) {
		this.tileset = tileset;
		this.tilesize = new Vector2(data.tilewidth, data.tileheight);

		const process_tilelayer_layer = (layer: any) => {
			for (const chunk of layer.chunks) {
				let layer_chunk = new WorldLayerChunk(chunk);

				if (layer.name == "Collision") {
					this.collision.push(layer_chunk);
				}

				if (layer.name == "Floor") {
					this.floor.push(layer_chunk);
				}
			}
		};

		const process_objectgroup_layer = (layer: any) => {
			for (const object of layer.objects) {
				let layer_object = new WorldLayerObject(object);

				if (layer.name == "Enemies") {
					this.enemies.push(layer_object);
				}

				if (layer.name == "NPCs") {
					this.npcs.push(layer_object);
				}

				if (layer.name == "Items") {
					this.items.push(layer_object);
				}

				if (layer.name == "Gates") {
					this.gates.push(layer_object);
				}

				if (layer.name == "Spawners") {
					this.spawners.push(layer_object);
				}
			}
		}

		for (const layer of data.layers) {
			if (layer.type == "tilelayer") {
				process_tilelayer_layer(layer);
			}

			if (layer.type == "objectgroup") {
				process_objectgroup_layer(layer);
			}
		}
	}
}

class Tile {
	id: number;
	image: HTMLImageElement;
	properties: { [key: string]: any };
}

export class TileSet {
	tilesize: Vector2 = new Vector2(32, 32);
	tiles: Array<Tile> = [];

	load_from_data(data: any) {
		this.tilesize = new Vector2(data.tileheight, data.tilewidth);

		for (const tile of data.tiles) {
			let image = new Image();
			image.src = tile.image;

			let properties: any = {};

			if(tile.properties != undefined) {
				for(const property of tile.properties) {
					properties[property.name] = property.value;
				}
			}

			this.tiles.push({
				id: tile.id + 1,
				image: image,
				properties: properties
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