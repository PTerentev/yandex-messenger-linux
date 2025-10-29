import path from "path";
import dotenv from "dotenv";
import { ROOT_DIR } from "./config";

export const ENVIRONMENTS = Object.freeze({
	DEVELOPMENT: "development",
	PRODUCTION: "production",
	TEST: "test",
} as const);

export type Environment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];

export function loadEnv(): void {
	const envPath = path.join(ROOT_DIR, ".env");
	dotenv.config({ path: envPath, override: false });
	if (!process.env.ENVIRONMENT) process.env.ENVIRONMENT = ENVIRONMENTS.DEVELOPMENT;
}

export function getEnvironment(): Environment {
	const value = String(process.env.ENVIRONMENT || ENVIRONMENTS.DEVELOPMENT).toLowerCase();
	switch (value) {
		case ENVIRONMENTS.PRODUCTION:
			return ENVIRONMENTS.PRODUCTION;
		case ENVIRONMENTS.TEST:
			return ENVIRONMENTS.TEST;
		case ENVIRONMENTS.DEVELOPMENT:
		default:
			return ENVIRONMENTS.DEVELOPMENT;
	}
}
