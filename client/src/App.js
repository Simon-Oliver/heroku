import React from 'react';
import logo from './logo.svg';
import './App.css';

class App extends React.Component {
  state = {
    lat: '',
    long: ''
  };

  componentDidMount() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(this.getPosition);
    }
  }

  getPosition = position => {
    this.setState({ lat: position.coords.latitude, long: position.coords.longitude });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <h2>Lat: {this.state.lat}</h2>
          <h2>Long: {this.state.long}</h2>
        </header>
      </div>
    );
  }
}

export default App;
