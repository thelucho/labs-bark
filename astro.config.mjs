// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Plus Jakarta Sans',
			cssVariable: '--font-sans',
			weights: [400, 500, 600, 700],
			fallbacks: ['system-ui', 'sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Instrument Serif',
			cssVariable: '--font-display',
			weights: [400],
			styles: ['italic', 'normal'],
			fallbacks: ['Georgia', 'serif'],
		},
	],
});
