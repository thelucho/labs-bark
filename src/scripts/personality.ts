import gsap from 'gsap';

const root = document.querySelector<HTMLElement>('[data-personality]');

if (root) setup(root);

function setup(root: HTMLElement) {
	const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
	const panels = [...root.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

	let active = 0;

	function select(next: number, moveFocus = false) {
		if (next === active) return;

		active = next;

		tabs.forEach((tab, index) => {
			const selected = index === active;
			tab.setAttribute('aria-selected', String(selected));
			tab.tabIndex = selected ? 0 : -1;
		});

		panels.forEach((panel, index) => {
			panel.hidden = index !== active;
		});

		if (moveFocus) tabs[active].focus();
		enter(panels[active]);
	}

	function enter(panel: HTMLElement) {
		const fill = panel.querySelector<HTMLElement>('[data-vibe-fill]');
		const items = panel.querySelectorAll<HTMLElement>('[data-vibe-item]');

		if (reduced.matches) {
			gsap.set(items, { clearProps: 'all' });
			return;
		}

		gsap.fromTo(
			items,
			{ opacity: 0, y: 14 },
			{
				opacity: 1,
				y: 0,
				duration: 0.55,
				ease: 'power3.out',
				stagger: 0.045,
				overwrite: true,
				clearProps: 'transform',
			},
		);

		if (fill) {
			const target = Number(getComputedStyle(fill).getPropertyValue('--fill')) || 0;
			gsap.fromTo(
				fill,
				{ scaleX: 0 },
				{ scaleX: target, duration: 0.9, ease: 'power3.out', overwrite: true },
			);
		}

		countUp(panel);
	}

	/** Ticks the percentage label up so the readout feels instrumented. */
	function countUp(panel: HTMLElement) {
		const label = panel.querySelector<HTMLElement>('[data-vibe-count]');
		if (!label) return;

		const target = Number(label.dataset.vibeCount) || 0;
		const counter = { value: 0 };

		gsap.to(counter, {
			value: target,
			duration: 0.9,
			ease: 'power3.out',
			overwrite: true,
			onUpdate: () => {
				label.textContent = `${Math.round(counter.value)}%`;
			},
		});
	}

	tabs.forEach((tab, index) => {
		tab.addEventListener('click', () => select(index));

		tab.addEventListener('keydown', (event) => {
			const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];

			if (step) {
				event.preventDefault();
				select((index + step + tabs.length) % tabs.length, true);
			} else if (event.key === 'Home') {
				event.preventDefault();
				select(0, true);
			} else if (event.key === 'End') {
				event.preventDefault();
				select(tabs.length - 1, true);
			}
		});
	});
}
