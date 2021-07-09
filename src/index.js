import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { apiInit as restInit } from './api/CoinGecko/api.js';
import { apiInit as websocketInit } from './api/CryptoCompare/api.js';

import { utils as coinscout } from './util/Utils.js';

import './index.css';

const apis = [ restInit, websocketInit ]

let initialized = 0;

function maybeRender(initRoutine) {

	//coinscout.log(`${initRoutine} complete!`);

	if(++initialized === apis.length) {
		coinscout.log('APIs initialized, rendering app...');
		ReactDOM.render(<App />, document.getElementById('root'));
		registerServiceWorker();
	}
}

apis.forEach(initRoutine => {
	//coinscout.log(`${initRoutine}...`);
	initRoutine(() => maybeRender(initRoutine));
});
