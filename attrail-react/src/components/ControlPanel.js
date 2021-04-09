import '../css/App.css';
import React, { Component } from 'react';
import LocationDataService from "../services/location.service";
import BlogDataService from "../services/blog.service";
import moment from 'moment'
import ProgressBar from 'react-bootstrap/ProgressBar';
import Button from 'react-bootstrap/button';
import Modal from 'react-bootstrap/modal';
import { ChevronRight, ChevronLeft, CheckCircleFill, SignpostSplit, ClockFill } from 'react-bootstrap-icons';
import { Terrain } from '@material-ui/icons';

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
        finishDate: null,
        totalAltitude: null,
      },
      blogLeftArrowShow: false,
      blogs: null,
      finished: false
    }

    this.blogRef = React.createRef()  
    this.handleModalClose = this.handleModalClose.bind(this);
    this.onBlogScroll = this.onBlogScroll.bind(this);
    this.leftBlogScroll = this.leftBlogScroll.bind(this);
    this.rightBlogScroll = this.rightBlogScroll.bind(this);
  }

  onBlogScroll(event) {
    const scrollX = event.currentTarget.scrollLeft
    if ( scrollX > 0 ) {
      this.setState( {blogLeftArrowShow:true} );
    }
    else {
      this.setState( {blogLeftArrowShow:false} );
    }
  }

  rightBlogScroll(event) {
    this.blogRef.current.scrollBy({top: 0, left: 200, behavior: 'smooth' })
  }

  leftBlogScroll(event) {
    this.blogRef.current.scrollBy({top: 0, left: -200, behavior: 'smooth' })
  }

  formatDate(date) {
    return moment(date).format('MMM DD, YYYY')
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
        if ( this.state.stats.finishDate )
          this.setState({finished: true });
        else 
          this.setState({finished: false });

        if ( this.state.stats.startDate )
          this.setState({ stats: { ...this.state.stats, startDate: this.formatDate(this.state.stats.startDate)}})
        if ( this.state.stats.finishDate )
          this.setState({ stats: { ...this.state.stats, finishDate: this.formatDate(this.state.stats.finishDate)}})
        if ( this.state.stats.estimateCompletionDate )
          this.setState({ stats: { ...this.state.stats, estimateCompletionDate: this.formatDate(this.state.stats.estimateCompletionDate)}})
        if ( this.state.stats.totalDistance )
          this.setState({milesLeft: Math.abs((2189 - this.state.stats.totalDistance).toFixed(0)) });
        if ( this.state.stats.totalAltitude)
          this.setState({everests: (this.state.stats.totalAltitude / 29029).toFixed(2)})
        if ( this.state.stats.trailName === "" )
          this.setState({ stats: { ...this.state.stats, trailName: "N/A"}})
      })
      .catch(e => {
        console.log(e);
      });
    }
    else {
      console.log("ERROR: Can't get stats - not logged in")
    }
  }

  getBlogList() {
    BlogDataService.getAll().then(response => {
      console.log(response.data);
      this.setState({blogs: response.data});
    });
  }

  componentDidMount() {
    this.getBlogList();
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
            <div className="col-12">
              <img className="profile" src="./DSC_0096.png" alt="Profile"></img>
            </div>
          </div>
          <div className="row">
            <div className="col-12 title">
              <h4>Grant's AT Thru Hike 2021</h4>
                <hr></hr>
              </div>
            </div>
            <div className="row">
              <div className=" col-12">
                <table class="table stats table-borderless">
                  {/* <thead class="thead-light">
                    <tr>
                      <th scope="col" colSpan={2} className="text-center">Hiking Stats</th>
                    </tr>
                  </thead> */}
                  <tbody>
                    <Stat label="Trail Name" stat={this.state.stats.trailName} finished={this.state.finished}></Stat>
                    <Stat label="Is On The AT" stat={this.state.stats.isOnTheAT} finished={this.state.finished} showIfFinished={false}></Stat>
                    <Stat label="Miles Hiked" unit="mi" round={0} stat={this.state.stats.totalDistance} finished={this.state.finished}></Stat>
                    <Stat label="Miles Left" unit="mi" round={0} stat={this.state.milesLeft} finished={this.state.finished}></Stat>
                    <Stat label="Miles Hiked Today" unit="mi" round={1} stat={this.state.stats.todayDistance} finished={this.state.finished} showIfFinished={false}></Stat>
                    <Stat label="Daily Average" unit="mi" round={0} stat={this.state.stats.dailyAverage} finished={this.state.finished}></Stat>
                    <Stat label="Elevation Gain/Loss" round={0} unit="ft" stat={this.state.stats.totalAltitude} finished={this.state.finished}></Stat>
                    <Stat label="Mount Everests Climbed" stat={this.state.everests} finished={this.state.finished}></Stat>
                    <Stat label="Days Hiking" unit="days" stat={this.state.stats.daysHiking} finished={this.state.finished}></Stat>
                    <Stat label="Start Date" stat={this.state.stats.startDate} finished={this.state.finished}></Stat>
                    <Stat label="Estimated Completion" stat={this.state.stats.estimateCompletionDate} finished={this.state.finished} showIfFinished={false}></Stat>
                    <Stat label="Finish Date" stat={this.state.stats.finishDate} finished={this.state.finished} showIfNotFinished={false}></Stat>
                    <Stat label="Percent Completion" unit="%" stat={this.state.stats.percentDone} finished={this.state.finished} showIfNotFinished={false}></Stat>
                    
                    {/*</tbody>{ this.state.stats.finishDate ? "" : (
                    )}
                    <div className="row">
                      <div className="offset-2 col-1 text-right">
                        <ClockFill></ClockFill>
                      </div>
                      <div className="col-5">
                        <div className='stat text-left'>Days Hiking:</div>
                      </div>
                      <div className="col-4">
                        <div className='value'>{this.state.stats.daysHiking !== null ? this.state.stats.daysHiking + " days" : nullChar}</div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="offset-3 col-5">
                        <div className='stat text-left'>Start Date:</div>
                      </div>
                      <div className="col-4">
                        <div className='value'>{this.state.stats.startDate !== null ? moment(this.state.stats.startDate).format('MMM DD, YYYY') : nullChar}</div>
                      </div>
                    </div>
                    { this.state.stats.finishDate ? "" : (
                    <div className="row">
                      <div className="offset-3 col-5">
                        <div className='stat text-left'>Estimated Completion:</div>
                      </div>
                      <div className="col-4">
                        <div className='value'>{this.state.stats.estimateCompletionDate !== null ? moment(this.state.stats.estimateCompletionDate).format('MMM DD, YYYY') : nullChar}</div>
                      </div>
                    </div>
                    )}
                    { this.state.stats.finishDate ? (
                    <div className="row">
                      <div className="offset-3 col-5">
                        <div className='stat text-left'>Finish Date:</div>
                      </div>
                      <div className="col-4">
                        <div className='value'>{this.state.stats.finishDate !== null ? moment(this.state.stats.finishDate).format('MMM DD, YYYY') : nullChar}</div>
                      </div>
                    </div>
                    ) : ""}    
                    <div className="row">
                      <div className="offset-3 col-5">
                        <div className='stat text-left'>Percent Completion:</div>
                      </div>
                      <div className="col-4">
                        <div className='value'>{this.state.stats.percentDone !== null ? Math.round(this.state.stats.percentDone) + "%": nullChar}</div>
                      </div>
                    </div> */}
                  </tbody>
                </table>
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
            <hr></hr>
            <div className="row">
              <div className="col-12 ml-4 mb-1">
                <h5 className="section-title">Updates</h5>
              </div>
            </div>
            <div className="blog-row">
              <div className="card-row" onScroll={this.onBlogScroll} ref={this.blogRef}>
                <div className="card-group flex-nowrap no-gutters">
                {
                  this.state.blogs == null
                    ? 'Loading blogs...'
                    : this.state.blogs.map(blog => (
                      <div className="col-6 mx-2 blog-card" key={blog.slug}>
                        <a href={blog.link}>
                          <span className="link-spanner"></span>
                        </a>
                        <div className="card">
                          <img src={blog.jetpack_featured_media_url} className="card-img-top" alt="test"></img>
                          <div className="card-body">
                            <p className="blog-title"><strong>{blog.title.rendered}</strong></p>
                            <p className="blog-date"><strong>{moment(blog.date).format('MMM DD, YYYY')}</strong></p>
                            <p className="card-text">{blog.excerpt.rendered.replace(/<[^>]+>/g, '')}</p>
                          </div>
                        </div>
                      </div>
                    ))
                }
                <div className="col-1"></div>
              </div>
              </div>
              <div className="right-arrow" onClick={this.rightBlogScroll}>
                <ChevronRight size={25} color="black"/>
              </div>
              { this.state.blogLeftArrowShow ? (
              <div className="left-arrow" onClick={this.leftBlogScroll}>
                <ChevronLeft size={25} color="black"/>
              </div>
              ) : "" }
              <hr></hr>
              <div className="row">
                <div className="col-12 ml-4 mb-1">
                  <h5 className="section-title">Get in Touch</h5>
                </div>
              </div>
              <div className="row">
                <div className="offset-2 col-3 text-right">
                  Email:
                </div>
                <div className="col-3">
                  <strong>gcs278@vt.edu</strong>
                </div>
              </div>
            </div>
          {/* <div className="row">
            <div className="col text-center logout">
              {logoutButton !== null ? logoutButton : ""}
            </div>
          </div> */}
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

function isNumeric(str) {
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

export function Stat(props: ComponentProps): JSX.Element {
  if ( ( props.finished && props.showIfFinished) || ( ! props.finished && props.showIfNotFinished) ){
    // console.log("stat: " + props.stat)
    // console.log("type: " + typeof props.stat)
    // console.log("isnumber: " + isNumeric(props.stat))
    var stat = props.stat

    if ( typeof props.stat  === "boolean" )
      stat = props.stat ? 'Yes' : 'No';
    if ( props.stat !== null && isNumeric(props.stat) ) {
      stat = parseFloat(props.stat)
      if ( props.round !== null )
        stat = stat.toFixed(props.round)
    }

    return(
      <tr>
        <td className="text-right">{props.label}</td>
        <td className="align-middle"><strong>{ stat != null ? stat : nullChar } {stat != null ? props.unit : ""}</strong></td>
      </tr>
    );
  }
  else {
    return(<></>);
  }
}

Stat.defaultProps = {
  finished: false,
  showIfNotFinished: true,
  showIfFinished: true,
  unit: ""  
}

export default ControlPanel;
