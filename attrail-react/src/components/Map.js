import logo from './logo.svg';
import '../css/App.css';
// import mapboxgl from 'mapbox-gl';
// import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import LocationDataService from "../services/location.service";
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactMapGL, {Marker, Source, Layer} from 'react-map-gl';
import Pin from './pin';
import { FlyToInterpolator } from "react-map-gl";

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ2NzMjc4IiwiYSI6ImNra2hzZWticDA0YzIycHFuazI4MmNyOTMifQ.H-DA4nbJSSFZZVmVAuuiWg';

const layerStyle = {
  id: 'atTrail',
  type: 'line',
  paint: {
    'line-color': 'black',
    'line-width': 3
  }
};

const myTrackStyle = {
  id: 'myTrack',
  type: 'line',
  paint: {
    'line-color': 'red',
    'line-width': 1
  }
};

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      marker: {
        latitude: 1,
        longitude: 1,
      },
      viewport: {
        latitude: 40.5,
        longitude: -79,
        zoom: 4.5,
        // transitionDuration: 5000,
        // transitionInterpolator: new FlyToInterpolator(),
        // bearing: 0,
        // pitch: 0
      },
      atGeojson: null,
      myTrack: null,
      stats: {
        totalDistance: null,
        todayDistance: null
      }
    };
    this.getLatestLocation = this.getLatestLocation.bind(this);
  }

  getLatestLocation() {
    LocationDataService.getLatest()
      .then(response => {
        this.setState({
          marker: {
            longitude: response.data.geometry.coordinates[0],
            latitude: response.data.geometry.coordinates[1]
          }
        });
        console.log("My Location:")
        console.log(this.state.marker.longitude);
        console.log(this.state.marker.latitude);

      })
      .catch(e => {
        console.log(e);
      });
  }

  getAllLocations() {
    LocationDataService.getMyTrack()
      .then(response => {
        this.setState({
          myTrack: response.data
        });
        // console.log("Got MyTrack:")
        // console.log(this.state.myTrack);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getTrailOverlay() {
    fetch('./at_full_reduced.geojson').then((res) => {
      return res.json();
    }).then((result) => {
      this.setState({
        atGeojson: result
      })
    })
  }
  
  getStats() {
    LocationDataService.stats()
    .then(response => {
      this.setState({
        stats: response.data
      });
      console.log("Total Distance:")
      console.log(this.state.stats.totalDistance);
    })
    .catch(e => {
      console.log(e);
    });
  }

  componentDidMount() {
    this.getLatestLocation();
    this.getAllLocations();
    this.getTrailOverlay();
    this.getStats();

    // const map = new mapboxgl.Map({
    //   container: this.mapContainer,
    //   style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    //   center: [this.state.lng, this.state.lat],
    //   zoom: this.state.zoom
    // });
    // map.on('move', () => {
    //   this.setState({
    //     lng: map.getCenter().lng.toFixed(4),
    //     lat: map.getCenter().lat.toFixed(4),
    //     zoom: map.getZoom().toFixed(2)
    //   });
    // });
    // map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // var marker = new mapboxgl.Marker()
    //   .setLngLat([this.state.lng, this.state.lat])
    //   .addTo(map);
    // this.setState = {
    //   marker: marker
    // }
  }

  render() {
    return (
      <>
        <ReactMapGL
          {...this.state.viewport}
          width="100vw"
          height="100vh"
          mapStyle='mapbox://styles/mapbox/streets-v11'
          onViewportChange={viewport => this.setState({viewport})}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          scrollZoom={{smooth: false}}
          // ayncRender={true}
          // transitionDuration={1000}
          // transitionInterpolator={new FlyToInterpolator()}
        >
          <Marker
            longitude={this.state.marker.longitude}
            latitude={this.state.marker.latitude}
            offsetTop={-20}
            offsetLeft={-10}
            // draggable
            // onDragStart={onMarkerDragStart}
            // onDrag={onMarkerDrag}
            // onDragEnd={onMarkerDragEnd}
          >
            <Pin size={20} />
          </Marker>
          <Source id="atTrail" type="geojson" data={this.state.atGeojson}>
            <Layer {...layerStyle} />
          </Source>
          <Source id="mytrack" type="geojson" data={this.state.myTrack}>
            <Layer {...myTrackStyle} />
          </Source>
          <div id="overlay" className="container">
            <h3>Grant AT Thru Hike 2021</h3>
            <hr></hr>
            <div className="row">
                <div className='stat'>Miles Hiked:</div>
                <div className='value'>{this.state.stats.totalDistance} mi</div>
            </div>
            <div className="row">
                <div className='stat'>Miles Hiked Today:</div>
                <div className='value'>{this.state.stats.todayDistance} mi</div>
            </div>
            <div className="row">
                <div className='stat'>Daily Average:</div>
                <div className='value'>{this.state.stats.dailyAverage} mi</div>
            </div>
            <div className="row">
                <div className='stat'>Days Hiking:</div>
                <div className='value'>{this.state.stats.daysHiking}</div>
            </div>
          </div>
        </ReactMapGL>
        </>
        // {/* <Marker
        //   coordinates={[-0.2416815, 51.5285582]}
        //   anchor="bottom">
        // </Marker> */}
        // <div ref={el => this.mapContainer = el} className='mapContainer' />
    );
  }
}

export default Map;
