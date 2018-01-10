import React, { Component } from 'react';

class CoinStack extends Component {
	
	constructor(props) {
		super(props);
		this.state = {};
	}
	
	componentDidUpdate() {

	}

	componentWillReceiveProps(nextProps) {
		// I'm being lazy here - price sometimes comes in as NaN and I haven't
		// been able to trace it back to its source. And it's late. So here's 
		// an if-check to prevent the UI from surfacing 'NaN' in those cases :/
		if(Number.isNaN(nextProps.price)) {
			return;
		}

		const symbol = nextProps.symbol;
		const price = nextProps.price;
		const stack = nextProps.stack;
		
		// Prices always USD for now
		const precision = 2;
		const sign = '$';

		// Max stack decimals for non-whole integer stack counts
		const stackDecimals = 3;

		let count = 0, stackSize;

		Object.keys(stack).forEach((exchange) => {
			stackSize = stack[exchange];
			count += parseFloat(stackSize === Math.floor(stackSize) ? stackSize : stackSize.toFixed(stackDecimals));
		});

		this.setState({
			count: count,
			symbol: symbol,
			sign: sign,
			value: parseFloat(count * price).toFixed(precision)
		}, () => nextProps.onValueChange && nextProps.onValueChange(this.state.value));
	}

	render() {
		/*
		console.log('CoinStack props:');
		console.dir(this.props);
		*/

		const count = this.state.count;
		const symbol = this.state.symbol;
		const sign = this.state.sign;
		const value = this.state.value;
		const showBalances = this.props.showBalances;

		return (
			<div className={'Coin-stack' + ((count === 0 || !showBalances) ? ' hidden' : '')}>
				<span className='Coin-stack-count'>{count} {symbol}</span>
				<span className='Coin-stack-value'>{sign}{value}</span>
			</div>
		);
	}

}

export default CoinStack;