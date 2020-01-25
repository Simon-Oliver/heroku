import React from 'react';
import mapboxgl from 'mapbox-gl';
import './App.css';

mapboxgl.accessToken =
  'pk.eyJ1Ijoic2ltb24tb2xpdmVyIiwiYSI6ImNrNXUyZ2U4bDBxeXQzbmxvY3piaXA3eXcifQ.XL9r5bMRqb-yAyHi0dRj3Q';

class App extends React.Component {
  state = {
    lat: '',
    long: '',
    message: '',
    acc: '',
    zoom: '2'
  };

  componentDidMount() {
    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    const success = pos => {
      var crd = pos.coords;

      this.setState({ lat: crd.latitude, long: crd.longitude, acc: crd.accuracy });
      console.log(`More or less ${crd.accuracy} meters.`);
    };

    const error = err => {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    };

    navigator.geolocation.getCurrentPosition(success, error, options);

    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.state.lat, this.state.long],
      zoom: this.state.zoom
    });

    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      })
    );

    fetch('/api/hello')
      .then(res => res.json())
      .then(data => this.setState({ message: data.express }));
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h2>Lat: {this.state.lat}</h2>
          <h2>Long: {this.state.long}</h2>
          <h2>Accuracy: {this.state.acc} meters</h2>
          <h3>{this.state.message}</h3>
          <div className="container">
            <div ref={el => (this.mapContainer = el)} className="mapContainer" />
          </div>
        </header>
      </div>
    );
  }
}

export default App;
