import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { apiInit } from './api/CryptoCompare/api.js';

apiInit(function() {
	ReactDOM.render(<App />, document.getElementById('root'));
	registerServiceWorker();
});
