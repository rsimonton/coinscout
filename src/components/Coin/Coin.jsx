import React, { Component } from 'react';
import CoinLabel from './CoinLabel.jsx';
import CoinPrice from './CoinPrice.jsx';
import CoinStack from './CoinStack.jsx';

import { apiSubscribe } from 'api/CryptoCompare/api.js';

import './Coin.css';

class Coin extends Component {
	
	constructor(props) {
		super(props);

		this.label = this.props.label;
		this.name = this.props.name;
		this.symbol = this.props.symbol;	// need a permanent reference

		this.priceChangeLast = CoinPrice.changeTypes[CoinPrice.UNCHANGED];		
		this.state = {weight: 0};

		this.handleClick = this.handleClick.bind(this);
		this.handleData = this.handleData.bind(this);
		this.handleStackValueChange = this.handleStackValueChange.bind(this);

		apiSubscribe(
			this.props.exchange,
			this.props.symbol,
			this.props.market,
			this.handleData
		);
	}

	componentWillReceiveProps(nextProps) {

		const priceRaw = nextProps.price;

		if(Number.isNaN(priceRaw)) {
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
				: 2;
		}

		//console.log(priceStr + ' length: ' + priceStr.length + ' precision: ' + pricePrecision)
		const priceNormalized = parseFloat(priceRaw).toFixed(pricePrecision);

		// Did the price go up/down or unchanged?
		const unchanged = priceNormalized == this.state.price;
		const priceChangeThis = unchanged
			? this.state.priceChange
			: CoinPrice.changeTypes[flags];

		//console.log('change: ' + flags + ' = ' + priceChangeThis);
		const newWeight = unchanged
			? this.state.weight
			: this.state.weight + (flags === CoinPrice.INCREASING ? 1 : -1);

		// Keep track of last price change
		this.priceChangeLast = priceChangeThis;

		this.setState({
			price: priceNormalized,
			priceChange: priceChangeThis,
			weight: newWeight});
		//}, () => console.log(nextProps.symbol + ': ' + newWeight));		
	}

	handleClick() {
		
		let link = false;

		switch(this.props.coinInfoSite) {
			case 'CoinMarketCap':
				link = 'https://coinmarketcap.com/currencies/' + this.props.name.toLowerCase().replace(/ /g, '-') + '/';
				break;
			case 'CryptoCompare':
				link = 'https://cryptocompare.com/coins/' + this.props.symbol.toLowerCase() + '/markets/' + this.props.market;
				break;
			case 'LiveCoinWatch':
				link = 'https://www.livecoinwatch.com/price/' + this.props.name.replace(/ /g, '') + '-' + this.props.symbol;
				break;
			default:
				console.log('No "coinInfoSite" config item set, ignoring coin click');
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
		//console.log(this.props);

		const {denomination, pricePrecision, stack, ...props} = this.props;
		const priceChange = this.state.priceChange;
		const price = this.state.price;
		const weight = this.state.weight;

		return (
			<div className={'Coin Coin-' + this.symbol} data-weight={weight} onClick={this.handleClick}>
				<CoinLabel name={this.name} label={this.label} />
				<CoinPrice
					change={priceChange}
					price={price}
					denomination={denomination} />
				<CoinStack
					onValueChange={this.handleStackValueChange}
					symbol={this.symbol}
					price={price}
					stack={stack || {}} 
					{...props} />				
			</div>
		);
	}

}

export default Coin;