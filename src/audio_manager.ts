export const Music = {
	Region1_OverworldTheme: new Audio("./assets/music/comes_adventures_-_overworld.opus")
}

export const Sounds = {
	GameOver: new Audio("./assets/sounds/PRZEGRANA.ogg"),
	Dialog: new Audio("./assets/sounds/DIALOG.mp3")
}

export class AudioManager {
	currently_playing_music: HTMLAudioElement;

	play_music(music: HTMLAudioElement, loop: boolean = false) {
		if (this.currently_playing_music == music) {
			music.play();
			return;
		}

		this.currently_playing_music = music;
		music.play();
		music.loop = loop;
	}

	stop_music() {
		this.currently_playing_music.pause();
	}

	play_sound(sound: HTMLAudioElement) {
		sound.play();
	}
};