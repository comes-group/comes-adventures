import { ItemInfo, ItemInformations } from "./item";
import World, { world } from "./world";

export interface QuestRequirement {
	item: ItemInfo,
	quantity: number
}

export interface Quest {
	name: string,
	requirements: Array<QuestRequirement>;
}

export const Quests: { [key: string]: Quest } = {
	"Region1_GetTheDaggerBoi": {
		name: "Get The Dagger comes",
		requirements: [
			{
				item: ItemInformations["Dagger"],
				quantity: 1
			}
		]
	},

	"Region1_CollectCalciumForArrows": {
		name: "Get calcium from enemies",
		requirements: [
			{
				item: ItemInformations["Calcium"],
				quantity: 16
			}
		]
	}
}

export class QuestManager {
	in_progress: Array<Quest> = [];
	completed: Array<Quest> = [];

	start_quest(quest: Quest) {
		for(const q of this.in_progress) {
			if(q == quest) {
				return;
			}
		}

		for(const q of this.completed) {
			if(q == quest) {
				return;
			}
		}

		this.in_progress.push(quest);
	}

	process_in_progress_quests() {
		let i = 0;

		for (const quest of this.in_progress) {
			for (const requirement of quest.requirements) {
				let item_quantity = 0;

				for (const playerEqItem of world.player.eq_items_inside) {
					if (playerEqItem.info == requirement.item) {
						item_quantity += 1;
					}
				}

				if (item_quantity == requirement.quantity) {
					this.in_progress.splice(i, 1);
					this.completed.push(quest);

					alert(`You completed quest ${quest.name}`);
				}
			}

			i += 1;
		}
	}
}