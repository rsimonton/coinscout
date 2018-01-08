import React, { Component } from 'react';

import coinConfig from './../../config/coins.js';
import './PortfolioSummary.css';

export default class PortfolioSummary extends Component {

	constructor(props) {
		super(props);
		this.formatter = this.props.formatters.USD;
	}

	render() {
		const coinPrices = this.props.prices,
			  showBalances = this.props.showBalances;

		// Behold the mighty power of Array.reduce!
		const portfolioValue = coinConfig.portfolio.reduce((total, coin) => {
			const coinCount = Object.values(coin.stack).reduce((total, count) => total + count);
			return total + (coinCount * coinPrices[coin.symbol]);
		}, 0);	// This zero specifies an initial value which is req'd when reducing arrays of objects

		const valueFormatted = this.formatter.format(portfolioValue);

		return (
			<div className={"Portfolio-summary " + (showBalances ? '' : 'hidden')}>
				<span className="Portoflio-value">
					<label>Portfolio Value:</label>&nbsp;<span>{valueFormatted}</span>
				</span>
			</div>
		);

	}

}