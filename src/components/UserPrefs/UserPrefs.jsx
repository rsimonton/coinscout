import React, { Component } from 'react';

export default class UserPrefs extends Component {

	static defaults = {
		convertValues: false
	}

	constructor(props) {
		super(props);
		this.state = Object.assign(UserPrefs.defaults, props);
	}

	componentDidMount() {
		console.log('UserPrefs:');
		console.dir(this.state);
	}

	render() {
		return null;
	}

}