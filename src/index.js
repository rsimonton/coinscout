import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { apiInit as restInit } from './api/CoinGecko/api.js';
import { apiInit as websocketInit } from './api/CryptoCompare/api.js';

import Logger from './util/Logger.js';

import './index.css';

const apis = [ restInit, websocketInit ],
	logger = new Logger('index.js');

let initialized = 0;

function maybeRender(initRoutine) {

	//logger.log(`${initRoutine} complete!`);

	if(++initialized === apis.length) {
		logger.log('APIs initialized, rendering app...');
		ReactDOM.render(<App />, document.getElementById('root'));
		registerServiceWorker();
	}
}

apis.forEach(initRoutine => {
	//logger.log(`${initRoutine}...`);
	initRoutine(() => maybeRender(initRoutine));
});
