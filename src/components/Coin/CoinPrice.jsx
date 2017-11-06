import React, { Component } from 'react';
import CCC from 'api/CryptoCompare/vendor.js';

class CoinPrice extends Component {
	
	render() {

		const pricePrecision = this.props.price
			? (this.props.symbol.match(/^USDT?$/)
				? 2
				: 1 + this.props.price.toString().search(/[1-9]/))	// decimal places
			: 0;
		
		const lastChange = [
			null,
			'increasing',
			'decreasing',
			null,
			'unchanged'
		];
	
		return (
			<span className={'Coin-price Coin-price-' + lastChange[this.props.flags]}>
				{CCC.STATIC.CURRENCY.SYMBOL[this.props.symbol]} {parseFloat(this.props.price).toFixed(pricePrecision)}
			</span>
		);
	}

}

export default CoinPrice;