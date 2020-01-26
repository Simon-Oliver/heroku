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

    var size = 100;

    // implementation of CustomLayerInterface to draw a pulsing dot icon on the map
    // see https://docs.mapbox.com/mapbox-gl-js/api/#customlayerinterface for more info
    var pulsingDot = {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),

      // get rendering context for the map canvas when layer is added to the map
      onAdd: function() {
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
      },

      // called once before every frame where the icon will be used
      render: function() {
        var duration = 1000;
        var t = (performance.now() % duration) / duration;

        var radius = (size / 2) * 0.3;
        var outerRadius = (size / 2) * 0.7 * t + radius;
        var context = this.context;

        // draw outer circle
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
        context.fill();

        // draw inner circle
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 100, 100, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        // update this image's data with data from the canvas
        this.data = context.getImageData(0, 0, this.width, this.height).data;

        // continuously repaint the map, resulting in the smooth animation of the dot
        map.triggerRepaint();

        // return `true` to let the map know that the image was updated
        return true;
      }
    };

    map.on('load', () => {
      map.loadImage(
        'https://upload.wikimedia.org/wikipedia/commons/a/a8/Ski_trail_rating_symbol_black_circle.png',
        function(error, image) {
          if (error) throw error;
          map.addImage('cat', image, {
            sdf: 'true'
          });
          map.addLayer({
            id: 'drone',
            type: 'symbol',
            source: 'drone',
            layout: {
              'icon-image': 'cat',
              'icon-size': 0.05,
              'icon-allow-overlap': true
            },
            paint: {
              'icon-color': '#00000f'
            }
          });
        }
      );
      window.setInterval(() => {
        const geoJson = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [this.state.long, this.state.lat]
          }
        };
        console.log(geoJson);
        map.getSource('drone').setData(geoJson);
      }, 2000);

      map.addSource('drone', {
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
