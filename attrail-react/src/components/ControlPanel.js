import '../css/App.css';
import React, { Component } from 'react';
import LocationDataService from "../services/location.service";
import moment from 'moment'
import ProgressBar from 'react-bootstrap/ProgressBar';
import Button from 'react-bootstrap/button';
import Modal from 'react-bootstrap/modal';
  
const nullChar = "?";

class ControlPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: {
        totalDistance: null,
        todayDistance: null,
        dailyAverage: null,
        percentDone: null,
        estimateCompletionDate: null,
        daysHiking: null,
        startDate: null,
        finishDate: null
      }
    }
    this.handleModalClose = this.handleModalClose.bind(this);
  }

  getStats() {
    if ( localStorage.getItem('token') ) {
      LocationDataService.stats()
      .then(response => {
        this.setState({
          stats: response.data
        });
        console.log("Total Distance:")
        console.log(this.state.stats.totalDistance);
        console.log(this.state.stats.finishDate)
        if ( ! this.state.stats.started )
          this.setState({showModal: true });
      })
      .catch(e => {
        if ( e.response.status === 401 ) {

        }
        console.log(e);
      });
    }
    else {
      console.log("ERROR: Can't get stats - not logged in")
    }
  }

  componentDidMount() {
    this.getStats();
  }

  logout() {
    localStorage.removeItem('token');
    window.location.reload();
  }

  handleModalClose() {
    this.setState({showModal: false});
  }

  render() {
    var logoutButton = null
    if ( localStorage.getItem('token') ) {
      logoutButton = <Button variant="primary" onClick={this.logout}>Logout</Button>
    }
    return (
      <>
        <div className="control-panel">
          <div className="row">
            <div className="col-12 logo">
              <img src="./thru-hike-tracker-side.png" alt="Thru Hike Tracker Logo"></img>
            </div>
          </div>
          <div className="row">
            <img className="profile" src="./DSC_0096.png" alt="Profile"></img>
          </div>
          <div className="row">
            <div className="col-12 title">
              <h4>Grant's AT Thru Hike 2021</h4>
                <hr></hr>
              </div>
            </div>
            { this.state.stats.finishDate ? "" : (
            <div className="row">
              <div className="col-7">
                <div className='stat'>Is On AT:</div>
              </div>
              <div className="col-5">
                <div className='value'>{ this.state.stats.isOnTheAT ? "Yes" : "No"}</div>
              </div>
            </div>
            )}
            <div className="row">
              <div className="col-7">
                <div className='stat'>Miles Hiked:</div>
              </div>
              <div className="col-4">
                <div className='value'>{this.state.stats.totalDistance !== null ? Math.round(this.state.stats.totalDistance)+ " mi" : nullChar}</div>
              </div>
            </div>
            <div className="row">
              <div className="col-7">
                <div className='stat'>Miles Left:</div>
              </div>
              <div className="col-4">
                <div className='value'>{this.state.stats.totalDistance !== null ? Math.abs((2189 - this.state.stats.totalDistance).toFixed(0)) + " mi" : nullChar}</div>
              </div>
            </div>
            { this.state.stats.finishDate ? "" : (
            <div className="row">
              <div className="col-7">
                <div className='stat'>Miles Hiked Today:</div>
              </div>
              <div className="col-4">
                <div className='value'>{this.state.stats.todayDistance !== null ? this.state.stats.todayDistance + " mi" : nullChar}</div>
              </div>
            </div>
            )}
            <div className="row">
              <div className="col-7">
                <div className='stat'>Daily Average:</div>
              </div>
              <div className="col-4">
                <div className='value'>{this.state.stats.dailyAverage !== null ? this.state.stats.dailyAverage + " mi" : nullChar}</div>
              </div>
            </div>
            <div className="row">
              <div className="col-7">
                <div className='stat'>Days Hiking:</div>
              </div>
              <div className="col-4">
                <div className='value'>{this.state.stats.daysHiking !== null ? this.state.stats.daysHiking + " days" : nullChar}</div>
              </div>
            </div>
            <div className="row">
              <div className="col-7">
                <div className='stat'>Start Date:</div>
              </div>
              <div className="col-4">
                <div className='value'>{this.state.stats.startDate !== null ? moment(this.state.stats.startDate).format('MMM DD, YYYY') : nullChar}</div>
              </div>
            </div>
            { this.state.stats.finishDate ? "" : (
            <div className="row">
              <div className="col-7">
                <div className='stat'>Estimated Completion:</div>
              </div>
              <div className="col-5">
                <div className='value'>{this.state.stats.estimateCompletionDate !== null ? moment(this.state.stats.estimateCompletionDate).format('MMM DD, YYYY') : nullChar}</div>
              </div>
            </div>
            )}
            { this.state.stats.finishDate ? (
            <div className="row">
              <div className="col-7">
                <div className='stat'>Finish Date:</div>
              </div>
              <div className="col-5">
                <div className='value'>{this.state.stats.finishDate !== null ? moment(this.state.stats.finishDate).format('MMM DD, YYYY') : nullChar}</div>
              </div>
            </div>
            ) : ""}    
            <div className="row">
              <div className="col-7">
                <div className='stat'>Percent Completion:</div>
              </div>
              <div className="col-5">
                <div className='value'>{this.state.stats.percentDone !== null ? Math.round(this.state.stats.percentDone) + "%": nullChar}</div>
              </div>
            </div>
            <div className="row">
              <div className="col-10 offset-1">
                <ProgressBar animated now={this.state.stats.percentDone} />
              </div>
            </div>
            { this.state.stats.finishDate ? (
            <div className="row">
              <div className="col text-center">
                <br></br>
                <h3>Hike Completed!</h3>
              </div>
            </div>
            ) : "" }
            <div className="row">
              <div className="col text-center logout">
                {logoutButton !== null ? logoutButton : ""}
              </div>
            </div>
        </div>
        <Modal show={this.state.showModal} onHide={this.handleModalClose} size="md" className="login-panel" centered>
        <Modal.Header closeButton>
          <img src="./thru-hike-tracker-side.png" alt="Thru Hike Tracker Logo"></img>
        </Modal.Header>
        <Modal.Body>
          <h5 className="text-center">Grant hasn't started hiking yet.</h5>
          <p className="text-center">Check back on {moment(this.state.stats.startDate).format('MMM DD, YYYY')}!</p>
        </Modal.Body>
      </Modal>
      </>
    );
  }
}

export default ControlPanel;
