#!/usr/bin/env node
// Regenerates the GENERATED KEYS block in the i18n priming fragment from:
//   - STANDARD_KEYS below (existing Liferay keys the element reuses — not
//     ours to define, so there's no properties file for these)
//   - language/Language.properties (the Language Client Extension — single
//     source of truth for this element's own i18npoc.* keys; see
//     https://learn.liferay.com/w/dxp/development/configuration-as-code/using-a-language-client-extension)
// Idempotent — safe to run repeatedly. Fails loudly if the marker comments
// are missing from the fragment.

const fs = require('fs');
const path = require('path');

const STANDARD_KEYS = ['welcome', 'save', 'cancel'];

const LANGUAGE_PROPERTIES_PATH = path.join(__dirname, '../language/Language.properties');
const FRAGMENT_HTML_PATH = path.join(
	__dirname,
	'i18n-priming-collection/i18n-priming-fragment/index.html'
);

const START_MARKER = '<#-- GENERATED KEYS START - do not hand-edit below this line.';
const END_MARKER = '<#-- GENERATED KEYS END -->';

function readCustomKeys(languagePropertiesText) {
	return languagePropertiesText
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith('#'))
		.map((line) => line.split('=')[0].trim());
}

function renderKeysBlock(keys) {
	return keys
		.map(
			(key, index) =>
				`\t\t\t'${key}': '\${languageUtil.get(locale, "${key}")?js_string}'` +
				(index < keys.length - 1 ? ',' : '')
		)
		.join('\n');
}

function main() {
	const languagePropertiesText = fs.readFileSync(LANGUAGE_PROPERTIES_PATH, 'utf8');
	const customKeys = readCustomKeys(languagePropertiesText);

	if (customKeys.length === 0) {
		throw new Error(`No keys found in ${LANGUAGE_PROPERTIES_PATH}`);
	}

	const keys = [...STANDARD_KEYS, ...customKeys];

	const fragmentHtml = fs.readFileSync(FRAGMENT_HTML_PATH, 'utf8');

	const startIndex = fragmentHtml.indexOf(START_MARKER);
	const endIndex = fragmentHtml.indexOf(END_MARKER);

	if (startIndex === -1 || endIndex === -1) {
		throw new Error(
			`Could not find GENERATED KEYS markers in ${FRAGMENT_HTML_PATH}. ` +
				'Expected both a START and END marker comment — regenerate aborted.'
		);
	}

	if (endIndex < startIndex) {
		throw new Error(
			`GENERATED KEYS END marker appears before START marker in ${FRAGMENT_HTML_PATH}.`
		);
	}

	const startMarkerLineEnd = fragmentHtml.indexOf('\n', startIndex);
	const before = fragmentHtml.slice(0, startMarkerLineEnd + 1);
	const after = fragmentHtml.slice(endIndex);

	const updatedFragmentHtml = `${before}${renderKeysBlock(keys)}\n${after}`;

	fs.writeFileSync(FRAGMENT_HTML_PATH, updatedFragmentHtml);

	console.log(`Regenerated ${keys.length} key(s) in ${FRAGMENT_HTML_PATH}:`);
	keys.forEach((key) => console.log(`  - ${key}`));
}

main();
