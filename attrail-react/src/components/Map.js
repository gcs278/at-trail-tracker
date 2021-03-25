import '../css/App.css';
// import mapboxgl from 'mapbox-gl';
// import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import LocationDataService from "../services/location.service";
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactMapGL, {Marker, Source, Layer} from 'react-map-gl';
import Pin from './pin';
import mapboxgl from "mapbox-gl"; // This is a dependency of react-map-gl even if you didn't explicitly install it
import circle from '@turf/circle';
import turf from 'turf'
import ControlPanel from './ControlPanel'
import LoginPanel from './LoginPanel'

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

// import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
// import MapboxWorker from 'mapbox-gl/dist/mapbox-gl-csp-worker';
// mapboxgl.workerClass = MapboxWorker;

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ2NzMjc4IiwiYSI6ImNra2hzZWticDA0YzIycHFuazI4MmNyOTMifQ.H-DA4nbJSSFZZVmVAuuiWg';

// Fix for broken mapbox
// mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

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

const circleFillStyle = {
  "id": "circle-fill",
  "type": "fill",
  "paint": {
      "fill-color": "blue",
      "fill-opacity": 0.5
  }
}

var circleRadius = 25;
var circleOptions = {
  steps: 80,
  units: 'miles'
};

class Map extends Component {
  constructor(props) {
    super(props);
    var viewport = {
        latitude: 40.5,
        longitude: -79,
        zoom: 4.5,
    }
    if ( window.innerWidth < 767 ) {
     viewport = {
        latitude: 33,
        longitude: -76.5,
        zoom: 3.75,
      }
    }
    
    this.state = {
      marker: {
        latitude: 1,
        longitude: 1,
      },
      viewport: viewport,
      atGeojson: null,
      myTrack: null,
      stats: {
        totalDistance: null,
        todayDistance: null
      },
      circleMarker: null
    };

    this.controlPanel = React.createRef();
    this.getLatestLocation = this.getLatestLocation.bind(this);
    this.getTrailData = this.getTrailData.bind(this);
  }

  getLatestLocation() {
    LocationDataService.getLatest()
      .then(response => {
        var latitude = response.data.geometry.coordinates[0];
        var longitude = response.data.geometry.coordinates[1];
        var center = turf.point([latitude, longitude]);
        this.setState({
          marker: {
            longitude: longitude,
            latitude: latitude
          },
          circleMarker: circle(center, circleRadius, circleOptions)
        });
        console.log("My Location:")
        // console.log(this.state.myLocation)
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
  
  getTrailData() {
    if ( localStorage.getItem('token') ) {
      this.getLatestLocation();
      this.getAllLocations();
      this.controlPanel.current.getStats();
    }
    else {
      console.log("ERROR: Can't get trail data - not logged in")
    }
  }

  componentDidMount() {
    document.title = "Thru Hike Tracker"
    this.getTrailOverlay();
    this.getTrailData();
  }

  render() {
    return (
      <>
      <div className="container-fluid">
        <ControlPanel ref={this.controlPanel}></ControlPanel>
        <LoginPanel onLoginSuccess={this.getTrailData}></LoginPanel>
        <div className="row">
            <ReactMapGL
              {...this.state.viewport}
              width="100vw"
              height="100vh"
              mapStyle='mapbox://styles/mapbox/streets-v11'
              onViewportChange={viewport => this.setState({viewport})}
              mapboxApiAccessToken={MAPBOX_TOKEN}
              attributionControl={false}
              scrollZoom={{smooth: false}}
              // ayncRender={true}
              // transitionDuration={1000}
              // transitionInterpolator={new FlyToInterpolator()}
            >
            <Marker
              longitude={this.state.marker.latitude}
              latitude={this.state.marker.longitude}
              offsetTop={-41}
              offsetLeft={-13.5}
              className={"mapboxgl-marker"}
              // draggable
              // onDragStart={onMarkerDragStart}
              // onDrag={onMarkerDrag}
              // onDragEnd={onMarkerDragEnd}
              >
                <Pin size={40} />
            </Marker>
            <Source id="atTrail" type="geojson" data={this.state.atGeojson}>
              <Layer {...layerStyle} />
            </Source>
            <Source id="mytrack" type="geojson" data={this.state.myTrack}>
              <Layer {...myTrackStyle} />
            </Source>
            {/* <Source
              type="geojson"
              data={this.state.circleMarker}
            >
              <Layer {...circleFillStyle} />
            </Source> */}
          </ReactMapGL>
        </div>
      </div>
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
