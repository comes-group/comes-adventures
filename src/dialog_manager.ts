export class Dialog {
	title: string;
	stages: Array<string>;
}

export class DialogManager {
	is_in_dialog = false;

	start_dialog(dialog: Dialog) {
		this.is_in_dialog = true;
	}
}