import React, { Component } from 'react';

class CoinStack extends Component {
	
	constructor(props) {
		super(props);
		this.formatter = this.props.formatters.USD;
		this.state = {};
	}
	
	componentWillReceiveProps(nextProps) {
		// I'm being lazy here - price sometimes comes in as NaN and I haven't
		// been able to trace it back to its source. And it's late. So here's 
		// an if-check to prevent the UI from surfacing 'NaN' in those cases :/
		if(Number.isNaN(parseFloat(nextProps.price)) || (nextProps.price === this.state.price && nextProps.stack === this.state.stack)) {
			return;
		}

		const symbol = nextProps.symbol;
		const price = nextProps.price;
		const stack = nextProps.stack || {};
		const breakdown = {};
		
		// Prices always USD for now
		const precision = 2;
		
		// Max stack decimals for non-whole integer stack counts
		const stackDecimals = 3;
		// Number of digits total to display for coin total
		const digits = 5;

		let count = 0, balanceFormatted;

		/*
		// Sort by balance, decreasing
		stack.sort((a, b) => a.balance < b.balance ? 1 : (a.balance === b.balance ? 0 : -1));

		stack.forEach(entry => {
			balanceFormatted = entry.balance === Math.floor(entry.balance)
				? entry.balance
				: entry.balance.toFixed(stackDecimals);

			// Source total, formatted
			breakdown[entry.source] = balanceFormatted;
			// Cummulative total
			count += parseFloat(entry.balance);
		});
		*/
		Object.keys(stack).forEach(source => {
			balanceFormatted = stack[source] === Math.floor(stack[source])
				? stack[source]
				: stack[source].toFixed(stackDecimals);

			// Source total, formatted
			breakdown[source] = balanceFormatted;
			// Cummulative total
			count += parseFloat(stack[source]);
		});

		// Determine how many decimal places we should display based on the 'digits'
		// const. If digits === 5, coin totals will display 5 digits, e.g.:
		//
		//	12487
		//	432.56
		//  0.0002
		//
		const countDecimals = Math.max(0, digits - String(Math.floor(count)).length);

		this.setState({
			breakdown: breakdown,
			count: count === Math.floor(count) ? count : count.toFixed(countDecimals),
			symbol: symbol,
			value: parseFloat(count * price).toFixed(precision)
		}, () => nextProps.onValueChange && nextProps.onValueChange(this.state.value));
	}

	render() {
		/*
		logger.log(`${this.props.symbol} CoinStack props:`);
		//console.dir(this.props);
		*/
		const breakdown = this.state.breakdown;
		const count = this.state.count;
		const countFormatted = Intl.NumberFormat().format(count);
		const symbol = this.state.symbol;
		const value = this.formatter.format(this.state.value);

		// We overload the show/hide stack/balance setting - if 'count' is zero, hide them
		const showBalances = this.props.settings.showBalances && count > 0;
		const showStack = this.props.settings.showStack && count > 0;

		// Build tooltip based on breakdown - the number of coins held in each
		// account (e.g. exchange or wallet)
		const tooltip = breakdown
			? Object.keys(breakdown).reduce((tooltip, account) => {
					return tooltip + '\n' + account + ': ' + breakdown[account];
				}, '')
			: 'Loading...';

		return (
			<div className={'Coin-stack'}>
				{showStack && <span className='Coin-stack-count' title={tooltip}>{countFormatted}</span>}
				{showBalances && <span className='Coin-stack-value'>{value}</span>}
			</div>
		);
	}

}

export default CoinStack;