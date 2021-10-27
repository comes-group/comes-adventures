import { EquippableSlot } from "./item";
import { Player, ItemInPlayerEq } from "./player";
import World from "./world";

export class UI {
	// HTML UI for
	//   - item picking
	//   - equipment
	//   - equipped slots
	ui_item_pick = document.getElementById('item-pick-dialog')
	ui_player_equipment = document.getElementById('player-equipment');
	ui_player_equipped_slots = document.getElementById('player-equipment').querySelectorAll(".scroll .player-info .equipped")[0];
	ui_npc_interaction = document.getElementById('interact-with-npc');
	ui_quests = document.getElementById('player-quests');
	ui_talk_dialogs = {
		container: document.getElementById('talk-with-npc-dialog'),
		dialog_image: document.getElementById('talk-with-npc-dialog').getElementsByTagName("img")[0],
		dialog_name: document.getElementById('talk-with-npc-dialog').getElementsByTagName("b")[0],
		dialog_text: document.getElementById('talk-with-npc-dialog').getElementsByTagName("span")[0],
		next_button: document.getElementById('talk-with-npc-dialog').getElementsByTagName("button")[0]
	};

	item_pick_dialog_visibility(visible: boolean) {
		if (visible) {
			this.ui_item_pick.style.display = "block";
		} else {
			this.ui_item_pick.style.display = "none";
			this.ui_item_pick.querySelectorAll("ul")[0].innerHTML = "";
		}
	}

	item_pick_dialog_add_item_name(name: string) {
		this.ui_item_pick.querySelectorAll("ul")[0].innerHTML += `<li>${name}</li>`;
	}

	npc_interaction_dialog_visibility(visible: boolean) {
		if (visible) {
			this.ui_npc_interaction.style.display = "block";
		} else {
			this.ui_npc_interaction.style.display = "none";
			this.ui_npc_interaction.querySelectorAll("span")[0].innerText = "";
		}
	}

	npc_interaction_dialog_set_npc_name(name: string) {
		this.ui_npc_interaction.querySelectorAll("span")[0].innerText = name;
	}

	// UI: Create HTML item element and return it
	// id is set to div
	eq_create_item_element(player: Player, item: ItemInPlayerEq, id: string): HTMLElement {
		let el = document.createElement("div");
		el.classList.add("item-in-eq");

		el.innerHTML = `
			<img src="${item.info.texture_url}" alt="">
			<span>${item.info.name}</span>
			<span></span>
		`;

		el.id = id;

		let drop_btn = document.createElement("button");
		drop_btn.innerText = "Drop";
		drop_btn.onclick = () => player.drop_item_from_eq(item);
		// Drop item event
		el.appendChild(drop_btn);

		return el;
	}

	eq_add_item_element(element: HTMLElement) {
		this.ui_player_equipment.querySelectorAll(".scroll")[0].appendChild(element);
	}

	eq_visibility(visible: boolean) {
		if (visible) {
			this.ui_player_equipment.style.display = "flex";
		} else {
			this.ui_player_equipment.style.display = "none";
		}
	}

	eq_redraw(player: Player) {
		// Clear container
		this.ui_player_equipped_slots.innerHTML = "";

		for (const k of Object.keys(player.eq_items_equippable_slots)) {
			// Treat k as EquippmentSlot enum
			const key = (k as unknown as EquippableSlot);

			if (key == EquippableSlot.WeaponSlot) {
				// Add bold text
				let b = document.createElement("b");
				b.innerText = "Weapon:";
				this.ui_player_equipped_slots.appendChild(b);

				// Check if iterated slot is empty, if not then
				if (player.eq_items_equippable_slots[key] != null) {
					// Create HTML UI element
					let el = this.eq_create_item_element(player, player.eq_items_equippable_slots[key], `EQ-EQUIPPED-IN-SLOT--${key}`);
					// Create HTML Button for unequip event
					let unequip_btn = document.createElement("button");

					el.getElementsByTagName("button")[0].onclick = () => {
						let id_item_in_eq = player.unequip_item_from_slot(key);
						player.drop_item_from_eq(player.get_item_by_id(id_item_in_eq));
					}

					// Configure button with text and event
					unequip_btn.innerText = "Unequip";
					unequip_btn.onclick = () => player.unequip_item_from_slot(key);

					// Add button to UI element
					el.appendChild(unequip_btn);
					// Add UI element to container
					this.ui_player_equipped_slots.appendChild(el);
					// Set new UI element in slot
					player.eq_items_equippable_slots[key].el = el;
				}

				// Add spacing to container
				this.ui_player_equipped_slots.appendChild(document.createElement("br"))
			}
		}
	}

	quests_render(world: World) {
		let quest_list = this.ui_quests.getElementsByTagName("ul")[0];
		quest_list.innerHTML = "";

		if (world.quest_man.in_progress.length == 0) {
			this.ui_quests.style.display = "none";
			return;
		}

		this.ui_quests.style.display = "block";

		for (const quest of world.quest_man.in_progress) {
			let total_html = ``;

			total_html += `<b>${quest.name}</b><ul>`;

			for (const req of quest.requirements) {
				total_html += `<li>Collect <b>${req.quantity}</b> <b>${req.item.name}</b></li>`;
			}

			total_html += `</ul></li>`;

			quest_list.innerHTML += total_html;
		}
	}

	text_dialog_refresh(world: World) {
		if (world.dialog_man.is_in_dialog) {
			this.ui_talk_dialogs.container.style.display = "block";
			this.ui_talk_dialogs.dialog_image.setAttribute("src", world.dialog_man.current_dialog.image);
			this.ui_talk_dialogs.dialog_name.innerText = world.dialog_man.current_dialog.name;
			this.ui_talk_dialogs.dialog_text.innerText =
				world.dialog_man.current_dialog.stages[world.dialog_man.current_stage];

			this.ui_talk_dialogs.next_button.onclick = () => {
				world.dialog_man.next_stage(world),
				this.text_dialog_refresh(world);
			};
		} else {
			this.ui_talk_dialogs.container.style.display = "none";
		}
	}
};