/**
 * Tiny progress bus shared by the hero frame preloader and the intro overlay, so
 * the intro counter follows real decoding work instead of a made-up timer.
 */
type Listener = (value: number) => void;

const listeners = new Set<Listener>();
let progress = 0;

/** Publishes a 0-1 ratio. Monotonic, so a late frame can never rewind the counter. */
export function reportProgress(value: number) {
	progress = Math.min(1, Math.max(progress, value));
	for (const listener of listeners) listener(progress);
}

/** Subscribes to progress and replays the current value, so late listeners never stall. */
export function watchProgress(listener: Listener) {
	listeners.add(listener);
	listener(progress);
}
