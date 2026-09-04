import gsap from 'gsap';
import lenis from './smooth-scroll';
import { watchProgress } from './load-progress';

/** Shortest run for the counter, so a warm cache reads as an intro instead of a flash. */
const MIN_DURATION = 1.5;
/** Hard release. The site must never stay behind the intro if a frame never resolves. */
const MAX_DURATION = 12;
/** How eagerly the counter chases real progress. Higher reacts faster. */
const EASING = 5;

const intro = document.querySelector<HTMLElement>('[data-intro]');

if (intro) start(intro);

function start(intro: HTMLElement) {
	const panel = intro.querySelector<HTMLElement>('[data-intro-panel]');
	const meta = intro.querySelector<HTMLElement>('[data-intro-meta]');
	const fill = intro.querySelector<HTMLElement>('[data-intro-fill]');
	const count = intro.querySelector<HTMLElement>('[data-intro-count]');

	if (!panel || !meta || !fill || !count) return;

	// The outro collapses onto the hero plate, so the page has to stay where it started.
	if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
	lenis.stop();
	lenis.scrollTo(0, { immediate: true, force: true });

	let loaded = 0;
	watchProgress((value) => {
		loaded = value;
	});

	const startedAt = performance.now();
	let shown = 0;
	let printed = -1;

	function render(value: number) {
		fill.style.setProperty('transform', `scaleX(${value})`);

		const percent = Math.round(value * 100);
		if (percent === printed) return;

		printed = percent;
		count.textContent = String(percent);
		intro.setAttribute('aria-valuenow', String(percent));
	}

	function tick(_time: number, deltaTime: number) {
		const elapsed = (performance.now() - startedAt) / 1000;
		// The counter is held back by whichever is further behind: real decoding work or
		// the minimum runtime. Past MAX_DURATION it is released no matter what.
		const ceiling = elapsed >= MAX_DURATION ? 1 : Math.min(loaded, elapsed / MIN_DURATION);
		const step = 1 - Math.exp((-EASING * Math.min(deltaTime, 100)) / 1000);

		shown += (ceiling - shown) * step;
		if (ceiling - shown < 0.001) shown = ceiling;

		render(shown);

		if (shown < 1) return;

		gsap.ticker.remove(tick);
		outro(intro, panel, meta);
	}

	render(0);
	gsap.ticker.add(tick);
}

function outro(intro: HTMLElement, panel: HTMLElement, meta: HTMLElement) {
	const release = () => {
		lenis.start();
		intro.remove();
		document.dispatchEvent(new Event('intro:done'));
	};

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		gsap.to(intro, { autoAlpha: 0, duration: 0.3, ease: 'none', onComplete: release });
		return;
	}

	const timeline = gsap.timeline({ defaults: { ease: 'power2.out' }, onComplete: release });
	const plate = plateClip();

	timeline.to(meta, { autoAlpha: 0, y: -12, duration: 0.4 }, 0.1);

	// Clipping instead of resizing keeps the gradient still while the plate closes in,
	// so it reads as the hero frame being cropped out of a full-bleed screen. Both
	// shapes are spelled out because GSAP interpolates the inset values pairwise.
	if (plate) {
		timeline.fromTo(
			panel,
			{ clipPath: 'inset(0px 0px 0px 0px round 0px)' },
			{ clipPath: plate, duration: 0.95, ease: 'power3.inOut' },
			0.3,
		);
	}

	timeline.to(panel, { autoAlpha: 0, duration: 0.6 }, '>-0.1');
}

/** The hero plate rect and radius, in the viewport space the fixed overlay already uses. */
function plateClip() {
	const plate = document.querySelector<HTMLElement>('[data-hero-plate]');
	if (!plate) return null;

	const box = plate.getBoundingClientRect();
	const root = document.documentElement;
	const radius = getComputedStyle(plate).borderTopLeftRadius;

	const right = Math.max(0, root.clientWidth - box.right);
	const bottom = Math.max(0, root.clientHeight - box.bottom);

	return `inset(${box.top}px ${right}px ${bottom}px ${box.left}px round ${radius})`;
}
