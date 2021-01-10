import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { apiInit as restInit } from './api/CoinGecko/api.js';
import { apiInit as websocketInit } from './api/CryptoCompare/api.js';

import './index.css';

const apis = [ restInit, websocketInit ]

let initialized = 0;

function maybeRender() {
	if(++initialized === apis.length) {
		ReactDOM.render(<App />, document.getElementById('root'));
		registerServiceWorker();
	}
}

apis.forEach(initRoutine => initRoutine(maybeRender));
