import { world } from "./world";

export const Music = {
	Region1_OverworldTheme: new Audio("./assets/music/comes_adventures_-_overworld.opus")
}

export const Sounds = {
	GameOver: new Audio("./assets/sounds/PRZEGRANA.ogg"),
	Dialog: new Audio("./assets/sounds/DIALOG.mp3"),
	PickupItem: new Audio("./assets/sounds/PODNIES_PRZEDMIOT.ogg"),
	Walk: new Audio("./assets/sounds/IDZ.ogg"),
	OrthoCollarDamage: new Audio("./assets/sounds/ORTHOCOLLAR_OBRAZENIA.ogg"),
	AttackSword: new Audio("./assets/sounds/UDERZENIE_MIECZ.ogg"),
	DamageToPlayer: new Audio("./assets/sounds/LAMANIE_KOSCI.ogg"),
	Attack_Shooting_OneDir: new Audio("./assets/sounds/ATAK_STRZELANIE_JEDEN_KIERUNEK.ogg")
}

export class AudioManager {
	currently_playing_music: HTMLAudioElement;

	play_music(music: HTMLAudioElement, loop: boolean = false) {
		if (this.currently_playing_music == music) {
			music.play();
			return;
		}

		music.volume = (world.ui.ui_general.music_volume.value as unknown as number / 100);

		this.currently_playing_music = music;
		music.play();
		music.loop = loop;
	}

	stop_music() {
		this.currently_playing_music.pause();
	}

	play_sound(sound: HTMLAudioElement) {
		sound.volume = (world.ui.ui_general.sound_volume.value as unknown as number / 100);
		sound.play();
	}
};