import React, { Component } from 'react';
import CoinLabel from './CoinLabel.jsx';
import CoinPrice from './CoinPrice.jsx';
import CoinStack from './CoinStack.jsx';

import { apiSubscribe } from 'api/CryptoCompare/api.js';

import './Coin.css';

class Coin extends Component {
	
	constructor(props) {
		super(props);

		this.symbol = this.props.symbol;	// need a permanent reference

		this.lastPrice = NaN;

		this.priceChangeLast = CoinPrice.changeTypes[CoinPrice.UNCHANGED];	
		this.priceHistory = {};

		this.state = {
			invalid: true,
			weight: 0
		};

		this.handleClick = this.handleClick.bind(this);
		this.handleData = this.handleData.bind(this);
		this.handleHide = this.handleHide.bind(this);
		this.handleStackValueChange = this.handleStackValueChange.bind(this);		
	}

	componentDidMount() {
		const subscribed = apiSubscribe(
			this.props.symbol,
			this.handleData
		);

		const newState = {subscribed: true};

		this.state.invalid && this.state.priced && (newState.invalid = false);

		this.setState(newState);
	}

	componentWillReceiveProps(nextProps) {

		const priceRaw = parseFloat(nextProps.price);

		if(Number.isNaN(priceRaw)) {
			this.state.invalid || this.setState({invalid: true});
			return;
		}

		const priceStr = priceRaw ? priceRaw.toString() : '';
		const flags = parseInt(this.state.FLAGS, 10);
		const denomination = nextProps.denomination;		
		const precisionRaw = nextProps.pricePrecision;
		
		let pricePrecision = 0;

		if(priceRaw) {
			const decimalIndex = priceStr.indexOf('.');
			pricePrecision = 'USD' !== denomination
				? decimalIndex + priceStr.substr(decimalIndex).search(/[1-9]/) + precisionRaw - 2
				: priceRaw < 1 ? 3 : 2;
		}

		//console.log('riceStr + ' length: ' + priceStr.length + ' precision: ' + pricePrecision)
		const priceNormalized = parseFloat(priceRaw).toFixed(pricePrecision);

		// Did the price go up/down or unchanged?
		const priceUnchanged = priceNormalized === parseFloat(this.state.price).toFixed(pricePrecision);
		const priceChangeThis = priceUnchanged
			? this.state.priceChange
			: CoinPrice.changeTypes[flags];

		//console.log('change: ' + flags + ' = ' + priceChangeThis);
		const newWeight = priceUnchanged
			? this.state.weight
			: this.state.weight + (flags === CoinPrice.INCREASING ? 1 : -1);

		// Keep track of last price change
		this.priceChangeLast = priceChangeThis;

		const newState = {};

		// we have a price, so we're valid now unless still not subscribed
		this.state.invalid && this.state.subscribed && (newState.invalid = false);
		
		priceUnchanged || Object.assign(newState, {
			price: priceNormalized,
			priceChange: priceChangeThis,
			weight: newWeight
		});

		Object.keys(newState).length && this.setState(newState);

		// This is where we were bubbling the coins weight change up to the app, 
		// with the idea that the app could sort the coins based on their weights.
		// This causes problems with React due to too many updates, which I'm not
		// sure what the cause of was, so shelving that idea for now.
		//priceUnchanged || this.props.onWeightChange(this.props.symbol, newWeight);
	}

	handleClick() {
		
		let link = false;

		switch(this.props.marketCapSite) {
			case 'CoinMarketCap':
				link = 'https://coinmarketcap.com/currencies/' + this.props.name.toLowerCase().replace(/ /g, '-') + '/';
				break;
			case 'CryptoCompare':
				link = 'https://cryptocompare.com/coins/' + this.props.symbol.toLowerCase() + '/markets/' + this.props.market;
				break;
			case 'LiveCoinWatch':
				link = 'https://www.livecoinwatch.com/price/' + this.props.name.replace(/ /g, '') + '-' + this.props.symbol;
				break;
			case 'Messari':
				link = 'https://messari.io/asset/' + this.props.name.toLowerCase().replace(/ /g, '-') + '/';
			default:
				console.log('No "marketCapSite" config item set, ignoring coin click');
				break;
		}

		link && window.open(link);
	}

	handleData(data) {
		//console.dir(data);
		this.setState(data, function() {
			this.props.onData(data)
		});
	}

	handleHide(event) {
		event.stopPropagation();
		this.props.onHide && this.props.onHide(this.props);
	}

	handlePriceChange(upOrDown) {
		const newWeight = this.state.weight + upOrDown;
		this.setState({weight: newWeight}, function() {
			console.log(this.props.symbol + ' new weight is: ' + this.state.weight);
		});
	}

	handleStackValueChange(newValue) {
		this.props.onStackValueChange && this.props.onStackValueChange(newValue);
	}

	render() {
		//console.log('his.props);

		const {denomination, label, name, pricePrecision, icon, stack, symbol, ...props} = this.props;
		const invalid = this.state.invalid;
		const priceChange = this.state.priceChange;
		const price = this.state.price;
		const weight = this.state.weight;
		const className = `Coin Coin-${symbol} ${invalid ? ' Coin-invalid' : ''}`;

		if(price !== this.lastPrice) {
			this.lastPrice = price;
			this.priceHistory[new Date().getTime()] = price;
		}

		return (
			<div className={className} data-weight={weight} onClick={this.handleClick}>
				<CoinHideButton onClick={this.handleHide} />
				<CoinLabel name={name} label={label} icon={icon} />
				<CoinPrice
					change={priceChange}
					price={price}
					denomination={denomination}
					priceHistory={this.priceHistory} />
				<CoinStack
					onValueChange={this.handleStackValueChange}
					symbol={this.symbol}
					price={price}
					stack={stack} 
					{...props} />				
			</div>
		);
	}

}

class CoinHideButton extends Component {
	render() {
		const {...props} = this.props;
		return <div className="Coin-hide-button" {...props}>✕</div>;
	}
}

export default Coin;