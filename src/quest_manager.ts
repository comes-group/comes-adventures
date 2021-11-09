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

	"Region1_CollectCalciumAndMinecraftStringForArrowsAndBow": {
		name: "Get calcium and Minecraft String from enemies",
		requirements: [
			{
				item: ItemInformations["Calcium"],
				quantity: 16
			},
			{
				item: ItemInformations["Minecraft_String"],
				quantity: 7
			},
			{
				item: ItemInformations["Some_Sticks"],
				quantity: 25
			}
		]
	}
}

export class QuestManager {
	in_progress: Array<Quest> = [];
	completed: Array<Quest> = [];

	start_quest(quest: Quest) {
		for (const q of this.in_progress) {
			if (q == quest) {
				return;
			}
		}

		for (const q of this.completed) {
			if (q == quest) {
				return;
			}
		}

		this.in_progress.push(quest);
	}

	process_in_progress_quests() {
		let i = 0;

		for (const quest of this.in_progress) {
			let completed_requirements = 0;

			for (const requirement of quest.requirements) {
				let item_quantity = 0;

				for (const playerEqItem of world.player.eq_items_inside) {
					if (playerEqItem.info == requirement.item) {
						item_quantity += 1;
					}
				}

				if (item_quantity == requirement.quantity) {
					completed_requirements += 1;
				}
			}

			if (completed_requirements == quest.requirements.length) {
				this.in_progress.splice(i, 1);
				this.completed.push(quest);

				alert(`You completed quest ${quest.name}`);
			}

			i += 1;
		}
	}
}