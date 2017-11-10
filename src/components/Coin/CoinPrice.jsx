import React, { Component } from 'react';
import CCC from 'api/CryptoCompare/vendor.js';

class CoinPrice extends Component {

	constructor(props) {
		super(props);
		
		this.changeType = [
			null,
			'increasing',
			'decreasing',
			null,
			'unchanged'
		];
	}
	
	render() {
		/*
		console.log('CoinPrice props:');
		console.dir(this.props);
		*/
		const pricePrecision = this.props.price
			? (this.props.denomination.match(/^USDT?$/)
				? 2
				: 1 + this.props.price.toString().search(/[1-9]/))	// decimal places
			: 0;

		return (
			<span className={'Coin-price Coin-price-' + this.changeType[this.props.flags]}>
				{CCC.STATIC.CURRENCY.SYMBOL[this.props.denomination]} {parseFloat(this.props.price).toFixed(pricePrecision)}
			</span>
		);
	}

}

export default CoinPrice;