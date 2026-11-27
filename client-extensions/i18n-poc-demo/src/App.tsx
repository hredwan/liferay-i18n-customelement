import React from 'react';

import {t} from './i18n';

function App() {
	return (
		<div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem'}}>
			<h2>{t('welcome')}</h2>

			<p>{t('i18npoc.greeting')}</p>

			<div style={{display: 'flex', gap: '0.5rem'}}>
				<button className="btn btn-primary" type="button">
					{t('save')}
				</button>

				<button className="btn btn-secondary" type="button">
					{t('cancel')}
				</button>

				<button className="btn btn-warning" type="button">
					{t('i18npoc.magic.button')}
				</button>
			</div>
		</div>
	);
}

export default App;
