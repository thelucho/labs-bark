import gsap from 'gsap';
import { reportProgress } from './load-progress';

const FRAME_COUNT = 101;
const LAST_FRAME = FRAME_COUNT - 1;

/** Frame 0 looks left, the middle frame looks straight ahead, the last one looks right. */
const frameSrc = (index: number) =>
	`/frames/kling_20260904_VIDEO_Use_the_2__5710_0_${String(index + 1).padStart(6, '0')}.jpg`;

/** Frames per second cap: keeps playback consecutive instead of jumping across the sequence. */
const MAX_FRAME_SPEED = 70;
/** How eagerly the head chases the pointer. Higher reacts faster, lower feels heavier. */
const EASING = 7;

const canvas = document.querySelector<HTMLCanvasElement>('[data-hero-canvas]');
const context = canvas?.getContext('2d', { alpha: false });

if (canvas && context) {
	init(canvas, context);
}

async function init(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
	const frames = await preloadFrames();

	let current = LAST_FRAME / 2;
	let target = current;
	let painted = -1;

	function paint(index: number) {
		if (index === painted) return;
		painted = index;

		const frame = frames[index];
		const scale = Math.max(canvas.width / frame.naturalWidth, canvas.height / frame.naturalHeight);
		const width = frame.naturalWidth * scale;
		const height = frame.naturalHeight * scale;

		context.drawImage(frame, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
	}

	function resize() {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.round(canvas.clientWidth * dpr);
		canvas.height = Math.round(canvas.clientHeight * dpr);
		painted = -1;
		paint(Math.round(current));
	}

	resize();
	window.addEventListener('resize', resize);
	reveal(canvas);

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	window.addEventListener('pointermove', (event) => {
		target = gsap.utils.clamp(0, 1, event.clientX / window.innerWidth) * LAST_FRAME;
	});

	gsap.ticker.add((_time, deltaTime) => {
		if (current === target) return;

		const seconds = Math.min(deltaTime, 100) / 1000;
		const distance = target - current;

		if (Math.abs(distance) < 0.01) {
			current = target;
		} else {
			// Never advance more than one frame per tick, so the sequence always plays
			// through neighbouring frames instead of jumping across the timeline.
			const step = distance * (1 - Math.exp(-EASING * seconds));
			const limit = Math.min(1, MAX_FRAME_SPEED * seconds);
			current += gsap.utils.clamp(-limit, limit, step);
		}

		paint(Math.round(current));
	});
}

async function preloadFrames() {
	let loaded = 0;

	const frames = Array.from({ length: FRAME_COUNT }, (_, index) => {
		const image = new Image();
		image.src = frameSrc(index);
		return image;
	});

	await Promise.all(
		frames.map(async (image) => {
			await image.decode().catch(() => undefined);
			loaded += 1;
			reportProgress(loaded / FRAME_COUNT);
		}),
	);

	return frames;
}

function reveal(canvas: HTMLCanvasElement) {
	gsap.to(canvas, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' });
}
