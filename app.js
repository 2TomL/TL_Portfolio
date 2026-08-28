"use strict";

import LiquidBackground from "https://cdn.jsdelivr.net/npm/threejs-components@0.0.27/build/backgrounds/liquid1.min.js";

const liquidCanvas = document.getElementById("liquid-canvas");
const liquidBackground = LiquidBackground(liquidCanvas);
liquidBackground.setRain(false);
liquidBackground.setRainTime(.02);
liquidCanvas.addEventListener("pointermove", (event) => event.stopPropagation());
liquidBackground.three.camera.position.set(0, 8, 8);
liquidBackground.three.camera.lookAt(0, 0, 0);
liquidBackground.three.updateWorldSize();
const fitLiquidPlane = () => {
	liquidBackground.liquidPlane.setSize(liquidBackground.three.size);
	liquidBackground.liquidPlane.scale.multiplyScalar(2.8);
};
fitLiquidPlane();
liquidBackground.three.onAfterResize = fitLiquidPlane;

const cube = document.querySelector("#cube");
let rotationX = -18;
let rotationY = -35;
let dragging = false;
let moved = false;
let startX = 0;
let startY = 0;
let startRotationX = rotationX;
let startRotationY = rotationY;
let activeSection = null;
const mobileMenuToggle = document.querySelector("#mobile-menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");
const vinylButton = document.querySelector("#vinyl-button");

vinylButton.addEventListener("click", () => {
	window.open("soundcloud-popup.html", "tl-soundcloud", "popup,width=620,height=315,resizable=yes,scrollbars=yes");
});

const aboutCanvas = document.querySelector("#about-canvas");
if (aboutCanvas) {
	const aboutContext = aboutCanvas.getContext("2d", { willReadFrequently: true });
	const aboutImage = new Image();
	const aboutPointer = { x: 0, y: 0, active: false };
	let aboutStarted = false;

	function drawAboutPortrait(time = 0) {
		if (!aboutImage.complete || !aboutImage.naturalWidth) return;
		const width = aboutCanvas.width;
		const height = aboutCanvas.height;
		const cell = 5;
		const sourceRatio = aboutImage.naturalWidth / aboutImage.naturalHeight;
		const canvasRatio = width / height;
		let sourceWidth = aboutImage.naturalWidth;
		let sourceHeight = aboutImage.naturalHeight;
		let sourceX = 0;
		let sourceY = 0;
		if (sourceRatio > canvasRatio) {
			sourceWidth = aboutImage.naturalHeight * canvasRatio;
			sourceX = (aboutImage.naturalWidth - sourceWidth) / 2;
		} else {
			sourceHeight = aboutImage.naturalWidth / canvasRatio;
			sourceY = (aboutImage.naturalHeight - sourceHeight) / 2;
		}
		aboutContext.fillStyle = "#080808";
		aboutContext.fillRect(0, 0, width, height);
		aboutContext.filter = "saturate(1.15) contrast(1.02)";
		aboutContext.drawImage(aboutImage, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
		const pixels = aboutContext.getImageData(0, 0, width, height).data;
		aboutContext.clearRect(0, 0, width, height);
		aboutContext.filter = "none";
		for (let y = 0; y < height; y += cell) {
			for (let x = 0; x < width; x += cell) {
				const pixelIndex = (y * width + x) * 4;
				const red = pixels[pixelIndex];
				const green = pixels[pixelIndex + 1];
				const blue = pixels[pixelIndex + 2];
				const brightness = (red * .299 + green * .587 + blue * .114) / 255;
				const distanceX = x / width - aboutPointer.x;
				const distanceY = y / height - aboutPointer.y;
				const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
				const pulse = Math.sin(time * .001 + x * .018 + y * .011) * .2;
				const depth = aboutPointer.active ? Math.max(0, 1 - distance * 3) * .8 : 0;
				const size = Math.max(.7, (1 - brightness) * 4 + pulse + depth);
				const offsetX = Math.sin(time * .0007 + y * .02) * (.35 + depth * .35);
				const offsetY = Math.cos(time * .0008 + x * .015) * (.35 + depth * .35);
				aboutContext.fillStyle = `rgba(${red}, ${green}, ${blue}, ${.45 + (1 - brightness) * .5})`;
				aboutContext.fillRect(x + offsetX, y + offsetY, size, size);
			}
		}
		window.requestAnimationFrame(drawAboutPortrait);
	}

	function updateAboutPointer(event) {
		const bounds = aboutCanvas.getBoundingClientRect();
		aboutPointer.x = (event.clientX - bounds.left) / bounds.width;
		aboutPointer.y = (event.clientY - bounds.top) / bounds.height;
		aboutPointer.active = true;
	}

	aboutCanvas.addEventListener("pointermove", updateAboutPointer);
	aboutCanvas.addEventListener("pointerenter", updateAboutPointer);
	aboutCanvas.addEventListener("pointerleave", () => { aboutPointer.active = false; });
	aboutImage.addEventListener("load", () => {
		if (!aboutStarted) {
			aboutStarted = true;
			drawAboutPortrait();
		}
	});
	aboutImage.src = "assets/about-other.png";
}

function updateCube() {
	cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
}

cube.addEventListener("pointerdown", (event) => {
	dragging = true;
	moved = false;
	startX = event.clientX;
	startY = event.clientY;
	startRotationX = rotationX;
	startRotationY = rotationY;
});

window.addEventListener("pointermove", (event) => {
	if (!dragging) return;
	const deltaX = event.clientX - startX;
	const deltaY = event.clientY - startY;
	if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) moved = true;
	rotationY = startRotationY + deltaX * 0.5;
	rotationX = startRotationX - deltaY * 0.5;
	updateCube();
});

window.addEventListener("pointerup", () => {
	dragging = false;
});

function handleFaceClick(event) {
	if (moved) {
		moved = false;
		event.preventDefault();
		return;
	}
	const face = event.currentTarget;
	if (face.dataset.id !== "home") {
		event.preventDefault();
		openSection(face.dataset.id);
		return;
	}
	if (document.body.classList.contains("section-open")) {
		event.preventDefault();
		closeSections();
		return;
	}
}

document.querySelectorAll(".face").forEach((face) => {
	face.addEventListener("click", handleFaceClick);
});

function setMobileMenu(open) {
	mobileMenuToggle.classList.toggle("is-active", open);
	mobileMenu.classList.toggle("is-open", open);
	document.body.classList.toggle("mobile-menu-open", open);
	mobileMenu.style.display = open ? "flex" : "";
	mobileMenu.style.visibility = open ? "visible" : "";
	mobileMenu.style.opacity = open ? "1" : "";
	mobileMenuToggle.setAttribute("aria-expanded", String(open));
	mobileMenuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
	mobileMenu.setAttribute("aria-hidden", String(!open));
}

mobileMenuToggle.addEventListener("click", () => {
	setMobileMenu(!mobileMenu.classList.contains("is-open"));
});

mobileMenu.querySelectorAll("[data-mobile-section]").forEach((link) => {
	link.addEventListener("click", () => {
		const sectionId = link.dataset.mobileSection;
		setMobileMenu(false);
		if (sectionId === "home") closeSections();
		else openSection(sectionId);
	});
});

function openSection(sectionId) {
	activeSection = sectionId;
	const scene = document.querySelector(".scene");
	const navbarAlreadyOpen = document.body.classList.contains("section-open");
	scene.classList.add("nav-open");
	if (!navbarAlreadyOpen) {
		scene.classList.remove("nav-entering");
		void scene.offsetWidth;
		scene.classList.add("nav-entering");
	}
	document.body.classList.add("section-open");
	document.querySelectorAll(".content-section").forEach((section) => {
		const isActive = section.dataset.section === sectionId;
		section.classList.toggle("active", isActive);
		section.setAttribute("aria-hidden", String(!isActive));
		section.style.opacity = isActive ? "1" : "0";
		section.style.visibility = isActive ? "visible" : "hidden";
	});
	document.querySelectorAll(".face").forEach((face) => {
		face.classList.toggle("active", face.dataset.id === sectionId);
	});
	mobileMenu.querySelectorAll("[data-mobile-section]").forEach((link) => {
		link.classList.toggle("active", link.dataset.mobileSection === sectionId);
	});
	if (!navbarAlreadyOpen) {
		window.setTimeout(() => scene.classList.remove("nav-entering"), 1500);
	}
}

function closeSections() {
	activeSection = null;
	document.body.classList.remove("section-open");
	document.querySelector(".scene").classList.remove("nav-open", "nav-entering");
	document.querySelectorAll(".content-section").forEach((section) => {
		section.classList.remove("active");
		section.setAttribute("aria-hidden", "true");
		section.style.opacity = "";
		section.style.visibility = "";
	});
	document.querySelectorAll(".face").forEach((face) => face.classList.remove("active"));
	mobileMenu.querySelectorAll("[data-mobile-section]").forEach((link) => link.classList.remove("active"));
	rotationX = -18;
	rotationY = -35;
	updateCube();
}

const snakeCanvas = document.querySelector("#snake-canvas");
if (snakeCanvas) {
	const snakeContext = snakeCanvas.getContext("2d");
	const snakeScore = document.querySelector("#snake-score");
	const snakeReplay = document.querySelector("#snake-replay");
	const snakeGameOver = document.querySelector("#snake-game-over");
	const gridSize = 20;
	const cellSize = snakeCanvas.width / gridSize;
	const foodColors = ["#ff2020", "#20c9ff", "#ffd020", "#b020ff", "#20e078"];
	let snake = [];
	let food = { x: 0, y: 0 };
	let foodColorIndex = -1;
	let foodColor = foodColors[0];
	let direction = { x: 1, y: 0 };
	let queuedDirection = direction;
	let gameScore = 0;
	let gameOver = false;
	let gameLoop;

	function placeFood() {
		foodColorIndex = (foodColorIndex + 1) % foodColors.length;
		foodColor = foodColors[foodColorIndex];
		do {
			food = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
		} while (snake.some((part) => part.x === food.x && part.y === food.y));
	}

	function drawGame() {
		snakeContext.fillStyle = "#080808";
		snakeContext.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
		snakeContext.strokeStyle = "rgba(255, 30, 30, .08)";
		snakeContext.lineWidth = 1;
		for (let index = 1; index < gridSize; index += 1) {
			const position = index * cellSize;
			snakeContext.beginPath();
			snakeContext.moveTo(position, 0);
			snakeContext.lineTo(position, snakeCanvas.height);
			snakeContext.moveTo(0, position);
			snakeContext.lineTo(snakeCanvas.width, position);
			snakeContext.stroke();
		}
		snakeContext.shadowBlur = 18;
		snakeContext.shadowColor = foodColor;
		snakeContext.fillStyle = foodColor;
		snakeContext.fillRect(food.x * cellSize + 2, food.y * cellSize + 2, cellSize - 4, cellSize - 4);
		for (const [index, part] of snake.entries()) {
			snakeContext.shadowColor = index === 0 ? "#fff" : "#ff2020";
			snakeContext.fillStyle = index === 0 ? "#fff" : "#d91414";
			snakeContext.fillRect(part.x * cellSize + 2, part.y * cellSize + 2, cellSize - 4, cellSize - 4);
		}
		snakeContext.shadowBlur = 0;
	}

	function finishGame() {
		gameOver = true;
		snakeGameOver.classList.add("is-visible");
		snakeGameOver.setAttribute("aria-hidden", "false");
		window.clearTimeout(gameLoop);
	}

	function tick() {
		if (gameOver) return;
		direction = queuedDirection;
		const head = {
			x: (snake[0].x + direction.x + gridSize) % gridSize,
			y: (snake[0].y + direction.y + gridSize) % gridSize
		};
		const hitSnake = snake.some((part) => part.x === head.x && part.y === head.y);
		if (hitSnake) {
			finishGame();
			return;
		}
		snake.unshift(head);
		if (head.x === food.x && head.y === food.y) {
			gameScore += 1;
			snakeScore.textContent = String(gameScore).padStart(2, "0");
			placeFood();
		} else {
			snake.pop();
		}
		drawGame();
		gameLoop = window.setTimeout(tick, 125);
	}

	function resetGame() {
		window.clearTimeout(gameLoop);
		snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
		direction = { x: 1, y: 0 };
		queuedDirection = direction;
		gameScore = 0;
		foodColorIndex = -1;
		gameOver = false;
		snakeScore.textContent = "00";
		snakeGameOver.classList.remove("is-visible");
		snakeGameOver.setAttribute("aria-hidden", "true");
		placeFood();
		drawGame();
		gameLoop = window.setTimeout(tick, 125);
	}

	function setDirection(nextDirection) {
		if (nextDirection.x === -direction.x && nextDirection.y === -direction.y) return;
		queuedDirection = nextDirection;
	}

	window.addEventListener("keydown", (event) => {
		const directions = { ArrowUp: { x: 0, y: -1 }, ArrowRight: { x: 1, y: 0 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 } };
		if (directions[event.key]) {
			event.preventDefault();
			setDirection(directions[event.key]);
		}
	});

	let touchStart = null;
	snakeCanvas.addEventListener("touchstart", (event) => {
		touchStart = event.touches[0];
	}, { passive: true });
	snakeCanvas.addEventListener("touchend", (event) => {
		if (!touchStart) return;
		const touch = event.changedTouches[0];
		const deltaX = touch.clientX - touchStart.clientX;
		const deltaY = touch.clientY - touchStart.clientY;
		if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 20) {
			setDirection(Math.abs(deltaX) > Math.abs(deltaY) ? { x: Math.sign(deltaX), y: 0 } : { x: 0, y: Math.sign(deltaY) });
		}
		touchStart = null;
	}, { passive: true });

	snakeReplay.addEventListener("click", (event) => {
		event.preventDefault();
		event.stopPropagation();
		resetGame();
	});
	resetGame();
}

const projectFrame = document.querySelector("#project-frame");
if (projectFrame) {
	const projects = [
		{ name: "DE STROOPERIJ", description: "De STrooperij event website.", image: "assets/projects/Project_De_STrooperij - Copy.png", live: "https://destrooperij.be/", github: "https://github.com/2TomL/De_STrooperij_FINAL" },
		{ name: "KIM MARTINI PROJECT", description: "Artist website.", image: "assets/projects/Project_KM - Copy.png", live: "http://www.djkimmartini.com", github: "https://github.com/2TomL/Kim_Martini" },
		{ name: "DJ SWORDZ", description: "Artist website.", image: "assets/projects/DJ_Swordz.png", live: "https://2toml.github.io/DJ_Swordz/", github: "https://github.com/2TomL/DJ_Swordz" },
		{ name: "VINYL WEBSHOP", description: "Online shop for the best vinyl in Brussels.", image: "assets/projects/docvin - Copy.png", live: "https://2toml.github.io/Recordshop_Showcase_frontend/", github: "https://github.com/2TomL/doctorvinyl-Final" },
		{ name: "TIFFANY NAUTS", description: "Clinical Psychologist.", image: "assets/projects/Project_psy - Copy.png", live: "https://2toml.github.io/Psycho_Tiff/", github: "https://github.com/2TomL/Psycho_Tiff" },
		{ name: "MIKEY'S MAGIC MIXER", description: "DJ set generator. Upload tracks, generate setlist, download list & mix.", image: "assets/projects/Project_MMMt - Copy.png", live: "#", github: "https://github.com/2TomL/Mikey-s_Magic_Mixer-tool", video: "assets/videos/Desktop 2025.08.26 - 20.32.04.03.mp4" },
		{ name: "DEEDS LOGO", description: "3D logo page with video integration.", image: "assets/projects/3D landing page Deeds.png", live: "https://2toml.github.io/Deeds_Logo/", github: "https://github.com/2TomL/Deeds_Logo" },
		{ name: "COOK14U", description: "Creative Gamer/Streamer platform.", image: "assets/projects/Project_Cook14u - Copy.png", live: "https://2toml.github.io/Cook14U_Final/", github: "https://github.com/2TomL/Cook14U_Final" },
		{ name: "EXCLUSIVE MOBILE APP", description: "For QR-scan", image: "assets/projects/KM_streetbeats - Copy.png", live: "https://2toml.github.io/2TomL-StreetBeats_V1/", github: "https://github.com/2TomL/2TomL-StreetBeats_V1" },
		{ name: "GAME DATABASE", description: "Web search engine for all computer games.", image: "assets/projects/project4-GDB.png", live: "#", github: "https://github.com/2TomL/ng-video-game-db" },
		{ name: "SAMPLE MIXER", description: "Audio sample mixing tool for creative projects.", image: "assets/projects/Project_Sample_Mixer - Copy.png", live: "https://2toml.github.io/sample_mixer/", github: "https://github.com/2TomL/sample_mixer" },
		{ name: "ARKANOID GAME", description: "Classic breakout game built with TypeScript.", image: "assets/projects/Arkanoid.png", live: "https://2toml.github.io/Game-Arkanoid/", github: "https://github.com/2TomL/Game-Arkanoid" },
		{ name: "BOUM", description: "Sandwich bar website.", image: "assets/projects/Boum2.png", live: "https://2toml.github.io/BOUM/", github: "https://github.com/2TomL/BOUM" },
		{ name: "CG LOGO", description: "3D logo design.", image: "assets/projects/3D landing page CG.png", live: "https://2toml.github.io/CG_Logo/", github: "https://github.com/2TomL/CG_Logo" },
		{ name: "CORVO LOGO", description: "3D logo design.", image: "assets/projects/Corvo Logo.png", live: "https://2toml.github.io/Corvo_Logo/", github: "https://github.com/2TomL/Corvo_Logo" }
	];
	const projectName = document.querySelector("#project-name");
	const projectDescription = document.querySelector("#project-description");
	const projectCount = document.querySelector("#project-count");
	const projectLive = document.querySelector("#project-live");
	const projectGithub = document.querySelector("#project-github");
	const projectVideo = document.querySelector("#project-video");
	const projectDots = document.querySelector("#project-dots");
	let projectIndex = 0;

	projects.forEach((project, index) => {
		const dot = document.createElement("button");
		dot.type = "button";
		dot.className = "project-dot";
		dot.setAttribute("aria-label", `Show project ${index + 1}`);
		dot.addEventListener("click", () => showProject(index));
		projectDots.append(dot);
	});

	function showProject(index) {
		projectIndex = (index + projects.length) % projects.length;
		const project = projects[projectIndex];
		projectFrame.style.backgroundImage = `url("${project.image}")`;
		projectName.textContent = project.name;
		projectDescription.textContent = project.description;
		projectCount.textContent = `${String(projectIndex + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
		projectGithub.href = project.github;
		projectGithub.style.display = project.github === "#" ? "none" : "grid";
		projectLive.href = project.live;
		projectLive.style.display = project.live === "#" ? "none" : "grid";
		projectVideo.href = project.video || "#";
		projectVideo.style.display = project.video ? "grid" : "none";
		projectDots.querySelectorAll(".project-dot").forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === projectIndex));
	}

	document.querySelector("#project-prev").addEventListener("click", () => showProject(projectIndex - 1));
	document.querySelector("#project-next").addEventListener("click", () => showProject(projectIndex + 1));
	showProject(0);
}

const designFrame = document.querySelector("#design-frame");
const designFrameImg = document.querySelector("#design-frame-img");
if (designFrame) {
	const designProjects = [
		{
			name: "THE GYM",
			description: "Creation visuals for socials, posters and flyers.",
			images: [
				"assets/grafics/TheGYM 1/514436863_24403243832607117_384529343356360637_n.jpg",
				"assets/grafics/TheGYM 1/514439259_24405673389030828_842109083036563276_n.jpg",
				"assets/grafics/TheGYM 1/514670273_24403242002607300_5762102013712317161_n.jpg",
				"assets/grafics/TheGYM 1/515508907_24449800901284743_755654626629366881_n.jpg"
			]
		},
		{
			name: "BITE BACK",
			description: "Graphic design for social media & posters.",
			images: [
				"assets/grafics/BITEBACK/graphic work 1.png",
				"assets/grafics/BITEBACK/25% zwarte tshirt - versie A1.png",
				"assets/grafics/BITEBACK/Affiche A4 - 25% zwarte tshirt .png",
				"assets/grafics/BITEBACK/graphic work 3.png"
			]
		},
		{
			name: "THE GYM 2",
			description: "Creation visuals for socials, posters and flyers.",
			images: [
				"assets/grafics/TheGym 2/514341560_24436146722650161_1556353330939209083_n.jpg",
				"assets/grafics/TheGym 2/514286939_24430114539920046_8224763668355133891_n.jpg",
				"assets/grafics/TheGym 2/515082657_24438066012458232_3410211601796381998_n.jpg",
				"assets/grafics/TheGym 2/72393593_2781331285225017_4255198681977847808_n.jpg"
			]
		},
		{
			name: "BOUM",
			description: "Visuals for social media.",
			images: [
				"assets/grafics/BOUM/graphic work 2.png",
				"assets/grafics/BOUM/BOUM Koffie.png",
				"assets/grafics/BOUM/BOUM Koffie 2.png",
				"assets/grafics/BOUM/flexi post 2 minder hoog.png"
			]
		},
		{
			name: "SOMETHING SOMETHING SATURDAY",
			description: "Creation visuals for socials, posters and flyers.",
			images: [
				"assets/grafics/SomSomSat/498557848_9733397090085754_5018291291344556034_n.jpg",
				"assets/grafics/SomSomSat/472334539_910380054631391_2791230436867479031_n.jpg",
				"assets/grafics/SomSomSat/496948385_9733384780086985_2704374218500600342_n.jpg",
				"assets/grafics/SomSomSat/498223728_9752928164799313_1900043364006079112_n.jpg",
				"assets/grafics/SomSomSat/498639343_9733397280085735_924811236822040607_n.jpg"
			]
		}
	];

	const designMainFrame = document.querySelector("#design-main-frame");
	const designMainName = document.querySelector("#design-main-name");
	const designMainDescription = document.querySelector("#design-main-description");
	const designMainCount = document.querySelector("#design-main-count");
	const designProjectDots = document.querySelector("#design-project-dots");
	const designLightbox = document.querySelector("#design-lightbox");
	const designName = document.querySelector("#design-name");
	const designDescription = document.querySelector("#design-description");
	const designCount = document.querySelector("#design-count");
	const designDots = document.querySelector("#design-dots");
	let activeProject = 0;
	let photoIndex = 0;

	designProjects.forEach((project, index) => {
		const dot = document.createElement("button");
		dot.type = "button";
		dot.className = "project-dot";
		dot.setAttribute("aria-label", `Show ${project.name}`);
		dot.addEventListener("click", () => showProjectPreview(index));
		designProjectDots.append(dot);
	});

	function showProjectPreview(index) {
		activeProject = (index + designProjects.length) % designProjects.length;
		const project = designProjects[activeProject];
		designMainFrame.style.backgroundImage = `url("${encodeURI(project.images[0])}")`;
		designMainName.textContent = project.name;
		designMainDescription.textContent = project.description;
		designMainCount.textContent = `${String(activeProject + 1).padStart(2, "0")} / ${String(designProjects.length).padStart(2, "0")}`;
		designProjectDots.querySelectorAll(".project-dot").forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === activeProject));
	}

	document.querySelector("#design-project-prev").addEventListener("click", () => showProjectPreview(activeProject - 1));
	document.querySelector("#design-project-next").addEventListener("click", () => showProjectPreview(activeProject + 1));
	designMainFrame.addEventListener("click", () => openDesignProject(activeProject));
	showProjectPreview(0);

	function renderDots(project) {
		designDots.innerHTML = "";
		project.images.forEach((image, index) => {
			const dot = document.createElement("button");
			dot.type = "button";
			dot.className = "project-dot";
			dot.setAttribute("aria-label", `Show photo ${index + 1}`);
			dot.addEventListener("click", () => showPhoto(index));
			designDots.append(dot);
		});
	}

	function showPhoto(index) {
		const project = designProjects[activeProject];
		photoIndex = (index + project.images.length) % project.images.length;
		const image = project.images[photoIndex];
		designFrameImg.src = encodeURI(image);
		designName.textContent = project.name;
		designDescription.textContent = project.description;
		designCount.textContent = `${String(photoIndex + 1).padStart(2, "0")} / ${String(project.images.length).padStart(2, "0")}`;
		designDots.querySelectorAll(".project-dot").forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === photoIndex));
	}

	function openDesignProject(index) {
		activeProject = index;
		renderDots(designProjects[activeProject]);
		showPhoto(0);
		designLightbox.classList.add("is-open");
		designLightbox.setAttribute("aria-hidden", "false");
	}

	function closeDesignLightbox() {
		designLightbox.classList.remove("is-open");
		designLightbox.setAttribute("aria-hidden", "true");
	}

	document.querySelector("#design-prev").addEventListener("click", () => showPhoto(photoIndex - 1));
	document.querySelector("#design-next").addEventListener("click", () => showPhoto(photoIndex + 1));
	document.querySelector("#design-close").addEventListener("click", closeDesignLightbox);
	document.querySelector("#design-backdrop").addEventListener("click", closeDesignLightbox);
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && designLightbox.classList.contains("is-open")) closeDesignLightbox();
	});
}

updateCube();
