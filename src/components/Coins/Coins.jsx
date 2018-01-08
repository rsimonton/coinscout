import React, { Component } from 'react';

import './Coins.css';

class Coins extends Component {

	render() {
		const coins = this.props.coins;

		return (
			<div className="Coins">
				{coins}
			</div>
		);
	}

}

export default Coins;