import React, { Component } from 'react';
import CCC from 'api/CryptoCompare/vendor.js';

class CoinPrice extends Component {

	render() {
		//console.log('his.props);
		const change = this.props.change;
		const price = this.props.price;
		const denomination = this.props.denomination;
		const priceHistory = this.props.priceHistory;
		const symbol = CoinPrice.SIGNS[denomination];

		const tooltip = Object.keys(priceHistory).reduce((title, timestamp) => {
			return title + timestamp + ': ' + priceHistory[timestamp] + '\n';
		}, '');

		return (
			<div className={'Coin-price Coin-price-' + change} title={tooltip}>
				<span className='Coin-price-sign'>{symbol}</span>
				<span className='Coin-price-price'>{price}</span>
			</div>
		);
	}

}

CoinPrice.INCREASING = 1;
CoinPrice.DECREASING = 2;
CoinPrice.UNCHANGED = 4;
CoinPrice.SIGNS = CCC.STATIC.CURRENCY.SYMBOL;

CoinPrice.changeTypes = [
	null,
	'increasing',
	'decreasing',
	null,
	'unchanged'
];

export default CoinPrice;