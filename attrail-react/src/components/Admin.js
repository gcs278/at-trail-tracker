import '../css/App.css';
import React, { Component } from 'react';
import {Button, Form} from 'react-bootstrap';
import LocationDataService from "../services/location.service";
import moment from 'moment'
import {Link} from "react-router-dom";

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      geoPerm: null,
      latitude: 0,
      longitude: 0,
      altitude: 0,
      startDate: "2021-04-11",
      finishDate: moment().format('YYYY-MM-DD')
    }
    this.handlePermission = this.handlePermission.bind(this);
    this.revealPosition = this.revealPosition.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.hangleLocationSubmit = this.hangleLocationSubmit.bind(this);
    this.handleDetailsSubmit = this.handleDetailsSubmit.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
    this.finishHike = this.finishHike.bind(this);
    this.unfinishHike = this.unfinishHike.bind(this);
    this.resetLocations = this.resetLocations.bind(this);
    this.tryCurrentPosition = this.tryCurrentPosition.bind(this);
    this.handleServerError = this.handleServerError.bind(this);
  }

  revealPosition(position) {
    console.log("Set Position")
    this.setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.altitude
    });
  }

  handlePermission() {
      this.setState({geoPerm: "unknown"});
      if ( navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({name:'geolocation'}).then(result => {
          this.setState({geoPerm: result.state});
          if (result.state === 'prompt' || result.state === 'granted' ) {
            this.tryCurrentPosition()
          }
          result.onchange = (event) => {
            this.setState({geoPerm: result.state});
          }
        });
      }
      else if (navigator.geolocation) {
        this.tryCurrentPosition()
      }
  }

  tryCurrentPosition() {
    navigator.geolocation.getCurrentPosition(this.revealPosition, function(error) {
      console.log("ERROR: Geolocation failed: " + error.code + " " + error.message)
      alert("ERROR: Geolocation failed: " + error.code + " " + error.message)
    }, {timeout:10000});
  }

  updateLocation(latitude, longitude, altitude) {
    this.setState({locationResult: ""});

    const now = new Date();
    LocationDataService.updateLocation({
      "locations": [
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [
              longitude,
              latitude
            ]
          },
          "properties": {
            "timestamp": now.toISOString(),
            "altitude": altitude,
          }
        }
      ]
    })
      .then(response => {
        this.setState({locationResult: "Successfully updated your location"});
      }
      ).catch(e => { this.handleServerError(e) });
  }

  resetLocations() {
    LocationDataService.deleteAll()
      .then(response => {
        this.setState({locationResult: "Successfully Deleted All Locations"});
      }
      ).catch(e => { this.handleServerError(e) });
  }

  hangleLocationSubmit(event) {
    event.preventDefault();
    this.updateLocation(this.state.latitude, this.state.longitude, this.state.altitude)
  }

  handleDetailsSubmit(event) {
    event.preventDefault();
    var data = {
      startDate: this.state.startDate,
    }
    if ( this.state.trailName !== "" )
      data.trailName = this.state.trailName 
    LocationDataService.updateDetails(data)
      .then(response => {
        this.setState({detailsResult: "Successfully updated hike details"});
      }
      ).catch(e => { this.handleServerError(e) });
  }

  finishHike(event) {
    event.preventDefault();

    LocationDataService.updateFinishDate({
      finishDate: this.state.finishDate
    })
      .then(response => {
        // Send the location of katahdin
        this.updateLocation(45.904239, -68.921149, 1600.088989)
      }
      ).catch(e => { this.handleServerError(e) });
  }

  handleServerError(e) {
    console.log(e);
    if ( ! e.response ) {
      this.setState({locationResult: "Couldn't connect to the server"});
    }
    else if ( e.response.status === 403 ){
      this.setState({locationResult: "Forbidden"});
    }
    else {
      this.setState({locationResult: "There was a problem with logging in:\n" + e});
    }
  }

  unfinishHike(event) {
    event.preventDefault();

    // Post a null date
    LocationDataService.updateFinishDate({
      finishDate: ""
    })
      .then(response => {
        // Send the location of katahdin
          this.setState({locationResult: "Unfinished Hike!"});
      }
      ).catch(e => { this.handleServerError(e) });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  componentDidMount() {
    if ( ! localStorage.getItem('token') ) {
      console.log("Not logged in...redirecting")
      window.location = '/login';
    }
    this.handlePermission()
  }

  render() {
    return (
        <div className="admin">
          <Form onSubmit={this.hangleLocationSubmit}>
            <h1>Admin Panel</h1>
            <Link to="/login">Login Page</Link>
            <p><strong>Geo Permission Status:</strong> {this.state.geoPerm}</p>
            <Form.Group size="lg" controlId="latitude">
              <Form.Label>Latitude</Form.Label>
              <Form.Control
                autoFocus
                name="latitude"
                value={this.state.latitude}
                onChange={this.handleInputChange}
              />
            </Form.Group>
            <Form.Group size="lg" controlId="longitude">
              <Form.Label>Longitude</Form.Label>
              <Form.Control
                name="longitude"
                autoFocus
                value={this.state.longitude}
                onChange={this.handleInputChange}
              />
            </Form.Group>
            <Button block size="lg" type="submit">Send Location</Button>
            <Button block variant="danger" size="md" onClick={this.resetLocations}>Reset All Locations</Button>
            <h5>{this.state.locationResult}</h5>
            <hr></hr>
            <Form.Group size="lg" controlId="longitude">
              <Form.Label>Finish Date</Form.Label>
              <Form.Control
                  name="finishDate"
                  value={this.state.finishDate}
                  onChange={this.handleInputChange}
                />
            </Form.Group>
            <Button block size="md" onClick={this.finishHike}>Finish Hike</Button>
            <Button block variant="danger" size="md" onClick={this.unfinishHike}>Unfinish Hike</Button>
            <hr></hr>
          </Form>
          <Form>
            <Form.Group size="lg" controlId="startDate">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                name="startDate"
                value={this.state.startDate}
                onChange={this.handleInputChange}
              />
              <Form.Label>Trail Name</Form.Label>
              <Form.Control
                name="trailName"
                value={this.state.trailName}
                onChange={this.handleInputChange}
              />
            </Form.Group>
            <Button block size="lg" onClick={this.handleDetailsSubmit}>Update Details</Button>
            <h5>{this.state.detailsResult}</h5>
          </Form>
        </div>
    );
  }
}

export default Admin;
