import React, { Component } from 'react';

import './PortfolioSummary.css';

export default class PortfolioSummary extends Component {

	constructor(props) {
		super(props);
		this.formatter = this.props.formatters.USD;
	}

	render() {
		const coins = this.props.coins,
			  coinPrices = this.props.prices,
			  showBalances = this.props.showBalances;

		// Behold the mighty power of Array.reduce!
		const portfolioValue = Object.keys(coins).reduce((total, symbol) => {
			let coin = coins[symbol];

			// We do not include hidden tokens' balances in portfolio balance
			if(undefined === coinPrices[coin.symbol] || true === coin.hidden) {
				return total;
			}

			//const coinCount = coin.stack.reduce((stack, source) => stack + source.balance, 0);
			const coinCount = Object.values(coin.stack).reduce((a, b) => a + b, 0);
			
			return total + (coinCount * coinPrices[coin.symbol]);
		}, 0);

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