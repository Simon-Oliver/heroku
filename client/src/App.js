import React from 'react';
import mapboxgl from 'mapbox-gl';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import './App.css';

const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const echoSocketUrl = socketProtocol + '//' + window.location.hostname;

const wsUrl = echoSocketUrl.includes('localhost') ? 'ws://192.168.1.3:8000' : echoSocketUrl;

const client = new W3CWebSocket(wsUrl, 'echo-protocol');
// const client = new WebSocket('ws://192.168.1.3:8000');
mapboxgl.accessToken =
  'pk.eyJ1Ijoic2ltb24tb2xpdmVyIiwiYSI6ImNrNXUyZ2U4bDBxeXQzbmxvY3piaXA3eXcifQ.XL9r5bMRqb-yAyHi0dRj3Q';

class App extends React.Component {
  state = {
    lat: '',
    long: '',
    message: '',
    acc: '',
    zoom: '2',
    other: [
      {
        id: 'Test1',
        lat: 47.350242,
        Long: 8.715513,
        color: '#00000f'
      },
      {
        id: 'Test2',
        lat: 47.350262,
        Long: 8.715533,
        color: '#e24f4f'
      }
    ]
  };

  //ws = new WebSocket('ws://192.168.1:3000'); //'wss://localhost:5000/' 'ws://192.168.1:8000'
  componentDidMount() {
    client.onopen = socket => {
      console.log('WebSocket Client Connected', socket);
    };

    client.onmessage = message => {
      console.log(JSON.parse(message.data));
    };

    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    const success = pos => {
      var crd = pos.coords;

      this.setState({ lat: crd.latitude, long: crd.longitude, acc: crd.accuracy });
      console.log(`More or less ${crd.accuracy} meters.`);
      client.send(
        JSON.stringify({
          lat: crd.latitude,
          long: crd.longitude,
          acc: crd.accuracy
        })
      );
    };

    const error = err => {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    };

    navigator.geolocation.watchPosition(success, error, options, {
      timeout: 5000,
      enableHighAccuracy: true
    });

    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/outdoors-v10',
      center: [this.state.long, this.state.lat],
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

    map.on('load', () => {
      this.state.other.forEach((e, i) => {
        map.loadImage(
          'https://upload.wikimedia.org/wikipedia/commons/a/a8/Ski_trail_rating_symbol_black_circle.png',
          function(error, image) {
            if (error) throw error;
            map.addImage(`circle${e.id}`, image, {
              sdf: 'true'
            });
            map.addLayer({
              id: e.id,
              type: 'symbol',
              source: e.id,
              layout: {
                'icon-image': `circle${e.id}`,
                'icon-size': 0.05,
                'icon-allow-overlap': true
              },
              paint: {
                'icon-color': e.color
              }
            });
          }
        );
        window.setInterval(() => {
          const geoJson = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [this.state.long + i, this.state.lat + i]
            }
          };
          map.getSource(e.id).setData(geoJson);
        }, 2000);

        map.addSource(e.id, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: [-76.53063297271729, 39.18174077994108]
                }
              }
            ]
          }
        });
      });
    });

    // map.on('load', function() {
    //   map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

    //   map.addLayer({
    //     id: 'points',
    //     type: 'symbol',
    //     source: {
    //       type: 'geojson',
    //       data: {
    //         type: 'FeatureCollection',
    //         features: [
    //           {
    //             type: 'Feature',
    //             geometry: {
    //               type: 'Point',
    //               coordinates: [this.lat, this.long]
    //             }
    //           }
    //         ]
    //       }
    //     },
    //     layout: {
    //       'icon-image': 'pulsing-dot'
    //     }
    //   });
    // });

    fetch('/api/hello')
      .then(res => res.json())
      .then(data => this.setState({ message: data.express }));
  }

  render() {
    return (
      <div className="App">
        <header className="App-header"></header>
        <div className="aligner">
          <h3>My Position: </h3>
          <p>Lat: {parseFloat(this.state.lat).toFixed(2)}</p>
          <p>Long: {parseFloat(this.state.long).toFixed(2)}</p>
          <p>Accuracy: {this.state.acc} meters</p>
          <p>Accuracy: {this.state.message} meters</p>
        </div>
        <p>{this.state.message}</p>
        <div className="container">
          <div ref={el => (this.mapContainer = el)} className="mapContainer" />
        </div>
      </div>
    );
  }
}

export default App;
