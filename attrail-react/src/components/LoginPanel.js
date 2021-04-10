import '../css/App.css';
import React, { Component } from 'react';
import Modal from 'react-bootstrap/modal';
import Button from 'react-bootstrap/button';
import Form from "react-bootstrap/Form";
import AuthDataService from "../services/auth.service";

class LoginPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      result: ""
    }
    this.validateForm = this.validateForm.bind(this);
    this.onLoginSuccess = this.onLoginSuccess.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  validateForm() {
    return this.state.password.length > 0;
  }

  componentDidMount() {
    if ( ! localStorage.getItem('token') ) {
      this.setState({open: true});
    }
  }

  setPassword(password) {
    this.setState({password: password});
  }

  onLoginSuccess() {
    this.props.onLoginSuccess()
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({result: ""});
    var email="default@thruhiketracker.com"
    AuthDataService.login({
      email: email,
      password: this.state.password
    })
      .then(response => {
        this.setState({result: "Successful Login!"});
        localStorage.setItem('token', response.data.token);
        this.setState({open: false});


        this.onLoginSuccess()
      }
      ).catch(e => {
        console.log(e);
        if ( !e.response ) {
          this.setState({result: "Couldn't connect to the server"});
        }
        else if ( e.response.status === 401 ){
          this.setState({result: "Incorrect passphrase!"});
        }
        else {
          this.setState({result: "There was a problem with logging in:\n" + e});
        }
      });
  }

  render() {
    return (
      <Modal show={this.state.open} size="md" className="login-panel" centered>
        <Modal.Header>
          <img src="./thru-hike-tracker-side.png" alt="Thru Hike Tracker Logo"></img>

          {/* <Modal.Title>Welcome</Modal.Title> */}
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group size="lg" controlId="password">
              <Form.Label>Enter the secret password to gain access:</Form.Label>
              <Form.Control
                type="password"
                onChange={(e) => this.setPassword(e.target.value)}
              />
              <Form.Label className="text-muted font-italic">Don't have the secret password? <a href="https://blog.thruhiketracker.com/access">Request it here.</a></Form.Label>
            </Form.Group>
            <h5 className="login-error">{this.state.result}</h5>
            <div class="text-right">
              <Button variant="primary" className="pull-right" type="submit" disabled={!this.validateForm}>
                Login
              </Button>
            </div>
          </Form>
        </Modal.Body>
        {/* <Modal.Footer>
          <img src="./thru-hike-tracker-side.png" alt="Thru Hike Tracker Logo"></img>
        </Modal.Footer> */}
      </Modal>
    );
  }
}

export default LoginPanel;
