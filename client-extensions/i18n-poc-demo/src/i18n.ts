declare global {
	interface Window {
		Liferay?: {
			Language?: {
				_cache?: Record<string, string>;
				get?: (key: string) => string;
			};
			ThemeDisplay?: {
				getBCP47LanguageId?: () => string;
			};
		};
	}
}

// i18npoc.* keys and English values here must match language/Language.properties
// (the Language Client Extension — source of truth the priming fragment's
// key list is generated from, see fragments/generate-keys.js). welcome/save/cancel
// are existing standard Liferay keys reused as-is. These strings are ONLY a
// fallback for when the priming fragment hasn't run against this page (e.g.
// no master page template, or standalone/local dev) — real translations,
// including English overrides, belong in Language Override (seeded by the
// Language Client Extension, then editable there with no redeploy).
const FALLBACKS: Record<string, string> = {
	welcome: 'Welcome',
	save: 'Save',
	cancel: 'Cancel',
	'i18npoc.greeting': 'Hello from the i18n POC!',
	'i18npoc.magic.button': 'Click the magic button',
};

export function t(key: string): string {
	const cache = window.Liferay?.Language?._cache;
	const getter = window.Liferay?.Language?.get;

	if (cache && getter) {
		const resolved = getter(key);

		if (resolved && resolved !== key) {
			return resolved;
		}
	}

	return FALLBACKS[key] ?? key;
}

export function getDirection(): 'ltr' | 'rtl' {
	const bcp47 =
		window.Liferay?.ThemeDisplay?.getBCP47LanguageId?.() ??
		(typeof navigator !== 'undefined' ? navigator.language : 'en-US');

	return bcp47.toLowerCase().startsWith('ar') ? 'rtl' : 'ltr';
}
