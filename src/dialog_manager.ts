import { Sounds } from "./audio_manager";
import World, { world } from "./world";

export class Dialog {
	name: string;
	image: string;
	stages: Array<string>;
}

export const Dialogs: { [key: string]: Dialog } = {
	'Region1_OldMan_WelcomeComes': {
		name: "",
		image: "",
		stages: [
			"Oh hello Comes i didn't saw you. You're finally here eh?",
			"As you might see this is different world from yours, magic things, random field with lake etc.",
			"Hero department summoned you here so you can defeat biggest world threads.",
			"Here, take this Dagger, it is from my old days as adventurer.",
			"Good luck!"
		]
	},

	'Region1_OldMan_NothingMoreToSay': {
		name: "",
		image: "",
		stages: [
			"Fight for freedom comes!"
		]
	},

	'Region1_Gate_HackingToTheGate': {
		name: "",
		image: "",
		stages: [
			"Hacking to the Gate",
			"..."
		]
	},

	'Region1_Blacksmith_WelcomeComes': {
		name: "",
		image: "",
		stages: [
			"Hey! So you are this new face on our land eh?",
			"As you might already tell our place is infested with monsters.",
			"I think...",
			"You should get bow and arrows!",
			"I can make some arrows and bow for you but I need materials.",
			"Collect me some strings, calcium and sticks."
		]
	},

	'Region1_Blacksmith_DoYourJob': {
		name: "",
		image: "",
		stages: [
			"Do not disturb me, just do your job."
		]
	},

	'Region1_Blacksmith_CalciumStringStickQuest_Complete': {
		name: "",
		image: "",
		stages: [
			"Wow, you REALLY collected them all.",
			"Here is your bow and arrows.",
			"And I will keep the rest as the payment..."
		]
	}
};

export class DialogManager {
	is_in_dialog = false;
	current_stage = 0;
	current_dialog: Dialog;
	on_dialog_end: () => void;

	start_dialog(
		dialog: Dialog,
		image_src: string = "https://cdn.discordapp.com/emojis/882989368573296670.png?size=96",
		name: string = "Hollow Man",
		on_dialog_end: () => void = () => {}
	) {
		if(this.is_in_dialog)
			return;

		this.is_in_dialog = true;

		this.current_dialog = dialog;
		this.current_dialog.image = image_src;
		this.current_dialog.name = name;

		this.on_dialog_end = on_dialog_end;

		world.ui.text_dialog_refresh();

		world.audio_man.play_sound(Sounds.Dialog);
	}

	next_stage() {
		if (this.current_dialog.stages.length - 1 == this.current_stage) {
			this.is_in_dialog = false;
			this.current_stage = 0;
			this.on_dialog_end();

			this.on_dialog_end = null;
		} else {
			this.current_stage += 1;
		}

		world.audio_man.play_sound(Sounds.Dialog);

		world.ui.text_dialog_refresh();
	}
}