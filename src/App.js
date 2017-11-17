import React, { Component } from 'react';

import Coin from './components/Coin/Coin.jsx';
import { apiInit, apiFinalize } from './api/CryptoCompare/api.js';
//import ApiManager from 'api/ApiManager.js';
//import UserPrefs from 'components/UserPrefs/UserPrefs.jsx';

import coinConfig from './config/coins.js';
import logo from './logo.svg';

import './App.css';

class App extends Component {

	constructor(props) {
		super(props);

		//this.apiManager = new ApiManager();
		this.rawPrices = { USD: 1 };
		this.userDenomination = 'USD';  // for now...		

		this.state = {
			// for now treat portfolio and watchlist the same
			coinConfig: coinConfig.portfolio.concat(coinConfig.watchlist),
			prices: {},
			signs: {}
		};

		this.handleData = this.handleData.bind(this);
		
		apiInit();
	}

	componentDidMount() {
		apiFinalize();

		/* A succesful experiment - reorder Coin elements iu UI based on symbol after 3 seconds -- cool!
		let self = this;
		window.setTimeout(function() {
			coinConfig.sort(function(a,b) {
				return a.symbol < b.symbol ? -1 : (a.symbol === b.symbol ? 0 : 1);
			});

			self.setState({coinConfig: coinConfig});
		}, 3000);
		*/
	}

	convertPrice(price, from, to) {
		//console.dir(arguments);
		return price * this.rawPrices[from] / this.rawPrices[to];
	}

	handleData(data) {
		const prices = this.state.prices;
		let convertedPrice = {};

		// Convert price iff user has overridden market set in coin config
		convertedPrice[data.FROMSYMBOL] = this.userDenomination && this.userDenomination !== data.TOSYMBOL
			? this.convertPrice(data.PRICE, data.TOSYMBOL, this.userDenomination)
			: data.PRICE;

		//console.log(data.FROMSYMBOL + ': ' + data.PRICE + ' ' + data.TOSYMBOL + ' --> ' + convertedPrice[data.FROMSYMBOL] + ' ' + this.userDenomination);
		//console.dir(convertedPrice);
		
		this.rawPrices[data.FROMSYMBOL] = data.PRICE;
		this.setState(Object.assign(prices, convertedPrice));
	}

	render() {

		//const userPrefs = <UserPrefs convertValues="USD" />;
		const coinConfig = this.state.coinConfig;
		const prices = this.state.prices;

		// Ok React, this is pretty rad - render Coins from JSON config array, write into variable
		const coins = coinConfig.map((coin, index) =>
			<Coin key={index}
				price={prices[coin.symbol]}
				denomination={this.userDenomination || coin.market}
				onData={this.handleData}
				{...coin} />
		);

		return (
			<div className="App">

				<div className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h2>Welcome to CoinScout</h2>
				</div>
			
				<div className="App-content">
					<div className="App-coins">
						{coins}
					</div>
				</div>
			
				<div className="App-footer">
					Data Courtesy of <a className="attribution" href="https://www.cryptocompare.com/">CryptoCompare.com</a>
				</div>
			
			</div>      
		);
	}
}

export default App;
