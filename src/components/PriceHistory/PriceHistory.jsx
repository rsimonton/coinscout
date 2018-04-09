import React, { Component } from 'react';

export default class PriceHistory extends Component {

	render() {

		const ticks = this.props.history.map((tick, index) {
			<PriceTick {...tick} />
		});

		<div id="price-history">
			<ul class="ticks">
				{ticks}
			</ul>
		</div>
	}

}