import React, { Component } from 'react';
import apiConnect from './api.js';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {};

    apiConnect(this.handleData.bind(this));
  }

  handleData(error, data) {
    this.setState(data);
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to CoinScout</h2>
        </div>
        <pre>{JSON.stringify(this.state)}</pre>
      </div>      
    );
  }
}

export default App;
