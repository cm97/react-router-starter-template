import type { Config } from "@react-router/dev/config";

export default {
	ssr: true,
	// Served at buzzyfly.com/kids through the main site's Worker.
	basename: "/kids",
	future: {
		unstable_viteEnvironmentApi: true,
	},
} satisfies Config;
