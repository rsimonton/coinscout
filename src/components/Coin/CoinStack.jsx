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

		let count = 0;

		Object.keys(stack).forEach((exchange) => count += stack[exchange]);

		const value = parseFloat(count * price).toFixed(precision);

		this.setState({
			count: count,
			symbol: symbol,
			sign: sign,
			value: value
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

		return (
			<div className={'Coin-stack' + (count === 0 ? ' hidden' : '')}>
				<span className='Coin-stack-count'>{count} {symbol}</span>
				<span className='Coin-stack-value'>{sign}{value}</span>
			</div>
		);
	}

}

export default CoinStack;