import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

/** Fallback release for the reveals, in case the intro never reports back. */
const INTRO_TIMEOUT = 15000;

navigation();

// Reveal targets are unhidden by a reduced-motion CSS rule, so nothing to undo here.
if (!reducedMotion.matches) {
	afterIntro(reveals);
	parallax();
	magnetics();
}

/**
 * Above-the-fold reveals would otherwise play behind the intro overlay and be gone
 * by the time it lifts, so they wait for it to finish.
 */
function afterIntro(run: () => void) {
	if (!document.querySelector('[data-intro]')) {
		run();
		return;
	}

	let started = false;
	const once = () => {
		if (started) return;
		started = true;
		run();
	};

	document.addEventListener('intro:done', once, { once: true });
	// Safety net: revealed content must never stay hidden if the intro script fails.
	window.setTimeout(once, INTRO_TIMEOUT);
}

/** Collapses the header into a floating glass bar once the hero starts scrolling away. */
function navigation() {
	const header = document.querySelector('[data-nav]');
	if (!header) return;

	ScrollTrigger.create({
		start: 'top -80',
		end: 99999,
		toggleClass: { className: 'is-floating', targets: header },
	});
}

/**
 * Single batched reveal pass for the whole page. Elements that scroll into view
 * together animate together, which keeps section entrances feeling composed.
 */
function reveals() {
	// Start values mirror the CSS resting offsets, so marking an element as
	// revealed never shifts it before the tween takes over.
	const settings: Record<string, { from: gsap.TweenVars; to: gsap.TweenVars }> = {
		up: { from: { y: 20, opacity: 0 }, to: { y: 0, opacity: 1, duration: 0.8 } },
		scale: { from: { scale: 1.04, opacity: 0 }, to: { scale: 1, opacity: 1, duration: 1.1 } },
		fade: { from: { opacity: 0 }, to: { opacity: 1, duration: 0.8 } },
	};

	for (const [name, { from, to }] of Object.entries(settings)) {
		ScrollTrigger.batch(`[data-reveal='${name}']`, {
			start: 'top 88%',
			once: true,
			onEnter: (batch) => {
				for (const element of batch) element.classList.add('is-revealed');

				gsap.fromTo(batch, from, {
					...to,
					ease: 'power3.out',
					stagger: 0.07,
					overwrite: true,
					// Hand transforms back to CSS so hover states are not fighting inline styles.
					clearProps: 'transform,willChange',
				});
			},
		});
	}
}

/** Depth cues for imagery. `data-parallax` holds the drift distance in percent. */
function parallax() {
	for (const element of document.querySelectorAll<HTMLElement>('[data-parallax]')) {
		const amount = Number(element.dataset.parallax) || 6;

		gsap.fromTo(
			element,
			{ yPercent: -amount / 2 },
			{
				yPercent: amount / 2,
				ease: 'none',
				scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true },
			},
		);
	}
}

/** Pointer-following buttons. Skipped entirely on touch so taps stay predictable. */
function magnetics() {
	if (!finePointer.matches) return;

	for (const element of document.querySelectorAll<HTMLElement>('[data-magnetic]')) {
		const strength = Number(element.dataset.magnetic) || 0.28;
		const moveX = gsap.quickTo(element, 'x', { duration: 0.5, ease: 'power3.out' });
		const moveY = gsap.quickTo(element, 'y', { duration: 0.5, ease: 'power3.out' });

		element.addEventListener('pointermove', (event) => {
			// getBoundingClientRect is read once per move on a single hovered node.
			const box = element.getBoundingClientRect();
			moveX((event.clientX - (box.left + box.width / 2)) * strength);
			moveY((event.clientY - (box.top + box.height / 2)) * strength);
		});

		element.addEventListener('pointerleave', () => {
			moveX(0);
			moveY(0);
		});
	}
}
