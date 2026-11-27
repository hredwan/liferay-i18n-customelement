import React from 'react';
import {Root, createRoot} from 'react-dom/client';

import App from './App';
import {getDirection} from './i18n';

const ELEMENT_NAME = 'i18n-poc-demo';

class I18nPocDemoElement extends HTMLElement {
	private _root?: Root;

	connectedCallback() {
		this.setAttribute('dir', getDirection());

		this._root = createRoot(this);
		this._root.render(<App />);
	}

	disconnectedCallback() {
		this._root?.unmount();
	}
}

if (!customElements.get(ELEMENT_NAME)) {
	customElements.define(ELEMENT_NAME, I18nPocDemoElement);
}
