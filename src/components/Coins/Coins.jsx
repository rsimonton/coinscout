import React, { Component } from 'react';

import './Coins.css';

class Coins extends Component {

	render() {
		
		const sortProp = 'symbol',
			coins = this.props.coins
				.slice(0)
				.sort((a, b) => a.props[sortProp] > b.props[sortProp] ? 1 : (a.props[sortProp] < b.props[sortProp] ? -1 : 0));

		return (
			<div className="Coins">
				{coins}
			</div>
		);
	}

}

export default Coins;