import World from "./world";

export class Dialog {
	name: string;
	image: string;
	stages: Array<string>;
}

export const Dialogs: { [key: string]: Dialog } = {
	'OldMan_WelcomeComes': {
		name: "",
		image: "",
		stages: [
			"Welcome Comes, this is world. You must defeat Final Boss.",
			"If you do not then you die."
		]
	}
};

export class DialogManager {
	is_in_dialog = false;
	current_stage = 0;
	current_dialog: Dialog;

	start_dialog(
		world: World,
		dialog: Dialog,
		image_src: string = "https://cdn.discordapp.com/emojis/882989368573296670.png?size=96",
		name: string = "Hollow Man"
	) {
		this.is_in_dialog = true;

		this.current_dialog = dialog;
		this.current_dialog.image = image_src;
		this.current_dialog.name = name;

		world.ui.text_dialog_refresh(world);
	}

	next_stage(world: World) {
		if (this.current_dialog.stages.length - 1 == this.current_stage) {
			this.is_in_dialog = false;
			this.current_stage = 0;
		} else {
			this.current_stage += 1;
		}

		world.ui.text_dialog_refresh(world);
	}
}