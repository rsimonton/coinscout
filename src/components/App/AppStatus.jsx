import React, { Component } from 'react';

import './AppStatus.css';

export default class AppStatus extends Component {

	render() {
		
		const status = this.props.status;

		return (
			<div className={"App-status " + status.toLowerCase()}>
				<span className="indicator"></span><span className="label">{status}</span>
			</div>
		);

	}

}