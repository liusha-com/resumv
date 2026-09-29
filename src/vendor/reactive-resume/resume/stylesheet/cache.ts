import type { CompileStylesheetResult } from "./types";

const MAX_ENTRIES = 128;
const cache = new Map<string, CompileStylesheetResult>();

export function getCachedStylesheet(key: string): CompileStylesheetResult | undefined {
	const value = cache.get(key);
	if (value === undefined) return;
	cache.delete(key);
	cache.set(key, value);
	return value;
}

export function setCachedStylesheet(key: string, value: CompileStylesheetResult): void {
	cache.delete(key);
	cache.set(key, value);
	while (cache.size > MAX_ENTRIES) {
		const oldestKey = cache.keys().next().value;
		if (oldestKey === undefined) break;
		cache.delete(oldestKey);
	}
}

const SEMANTIC_CSS_COMPILER_BUILD_ID = "semantic-css-v1-values-2";

export function stylesheetCacheKey(languageVersion: number, source: string, registry: string): string {
	return JSON.stringify([languageVersion, source, SEMANTIC_CSS_COMPILER_BUILD_ID, registry]);
}
