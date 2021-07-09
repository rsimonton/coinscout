import React, { Component } from 'react';

import './PortfolioSummary.css';

export default class PortfolioSummary extends Component {

	constructor(props) {
		super(props);
		this.state = {};
		this.formatter = this.props.formatters.USD;
	}

	componentWillReceiveProps(nextProps) {

		// allTimeHigh is an object with 'timestamp' and 'value' fields
		const { allTimeHigh, coins, prices, showBalances, ...props } = nextProps;

		// Behold the mighty power of Array.reduce!
		const portfolioValue = Object.keys(coins).reduce((total, symbol) => {
			let coin = coins[symbol];

			// We do not include hidden tokens' balances in portfolio balance
			if(undefined === prices[coin.symbol] || true === coin.hidden) {
				return total;
			}

			//const coinCount = coin.stack.reduce((stack, source) => stack + source.balance, 0);
			const coinCount = Object.values(coin.stack).reduce((a, b) => a + b, 0);
			
			return total + (coinCount * prices[coin.symbol]);
		}, 0);

		const valueFormatted = this.formatter.format(portfolioValue),
			  prevAth = allTimeHigh.value || 0,
			  percentAth = 0 === prevAth ? 0 : Math.round(portfolioValue * 100 / prevAth);

		this.setState(
			{
				portfolioValue: valueFormatted,
				percentAth: percentAth
			},
			() => {
				portfolioValue > prevAth
					&& nextProps.onAllTimeHigh
					&& nextProps.onAllTimeHigh(portfolioValue);
			}
		);

	}

	render() {

		const percentAth = this.state.percentAth,
			  portfolioValue = this.state.portfolioValue;

		const allTimeHigh = this.props.allTimeHigh,
			  showBalances = this.props.showBalances;

		const athValueFormatted = this.formatter.format(allTimeHigh.value),
			  valueTitle = `${percentAth}% (${athValueFormatted} on ${new Date(allTimeHigh.timestamp).toLocaleString()})`;

		return (
			<div className={"Portfolio-summary " + (showBalances ? '' : 'hidden')}>
				<span className="Portoflio-value">
					<label>Portfolio Value:</label>&nbsp;<span title={valueTitle}>{portfolioValue}</span>
				</span>
			</div>
		);
	}

}