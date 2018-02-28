import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { apiInit } from './api/CryptoCompare/api.js';

import './index.css';

apiInit(() => {
	ReactDOM.render(<App />, document.getElementById('root'));
	registerServiceWorker();
});
