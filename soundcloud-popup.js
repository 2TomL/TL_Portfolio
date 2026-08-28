"use strict";

const mixSelect = document.querySelector("#mix-select");
const iframe = document.querySelector("#sc-iframe");
const playerFrame = document.querySelector(".player-frame");
const playerStatus = document.querySelector("#player-status");
const playerNote = document.querySelector("#player-note");
const volume = document.querySelector("#popout-volume");
let widget = null;
let widgetReady = false;
const mixes = [
	{ name: "MIKEY_MIKE PROFILE", url: "https://soundcloud.com/mickedy_mike" },
	{ name: "MIKE MIX / CONTRE CULTURE", url: "https://soundcloud.com/mickedy_mike/mike-mix-for-contre-culture-30-06-16" },
	{ name: "MIKE'S NY 2016 MIX", url: "https://soundcloud.com/mickedy_mike/mikes-ny-2016-mix" },
	{ name: "PROJECT 4", url: "https://soundcloud.com/mickedy_mike/project-4" },
	{ name: "PROJECT 8", url: "https://soundcloud.com/mickedy_mike/project-8" },
	{ name: "PROJECT 7", url: "https://soundcloud.com/mickedy_mike/project-7" }
];

function showPlayerMessage(message) {
	playerStatus.textContent = message;
	playerNote.textContent = "Add a SoundCloud track or playlist URL in soundcloud-popup.js to activate the player.";
}

function loadMix(url) {
	if (!url) {
		showPlayerMessage("No SoundCloud mix configured");
		return;
	}
	playerStatus.textContent = "Loading player...";
	playerFrame.classList.remove("is-ready");
	widgetReady = false;
	const widgetUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff2020&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false`;
	iframe.src = widgetUrl;
	let settled = false;
	const timeout = window.setTimeout(() => {
		if (settled) return;
		playerStatus.textContent = "SoundCloud is taking too long to respond";
		playerNote.textContent = "You can still use the page; try selecting the mix again later.";
	}, 8000);
	iframe.addEventListener("load", () => {
		settled = true;
		window.clearTimeout(timeout);
		if (!window.SC || typeof window.SC.Widget !== "function") {
			playerStatus.textContent = "SoundCloud controls unavailable";
			playerNote.textContent = "The SoundCloud Widget API could not be loaded.";
			return;
		}
		widget = SC.Widget(iframe);
		widget.bind(SC.Widget.Events.READY, () => {
			widgetReady = true;
			widget.setVolume(Number(volume.value));
			playerFrame.classList.add("is-ready");
			playerNote.textContent = "Player ready.";
		});
	}, { once: true });
}

mixes.forEach((mix) => {
	const option = document.createElement("option");
	option.value = mix.url;
	option.textContent = mix.name;
	mixSelect.append(option);
});

mixSelect.addEventListener("change", () => loadMix(mixSelect.value));
volume.addEventListener("input", () => {
	if (widgetReady && widget) widget.setVolume(Number(volume.value));
	playerNote.textContent = `Volume ${volume.value}%`;
});

if (mixes.length) {
	loadMix(mixes[0].url);
} else {
	showPlayerMessage("No SoundCloud mix configured");
}
