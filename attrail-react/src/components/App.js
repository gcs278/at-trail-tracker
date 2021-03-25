import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Map from './Map';
import Login from './Login';
import Register from './Register';
import Admin from './Admin';

export default function BasicExample() {
  return (
    <Router>
      <div>
        {/* <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
        </ul>

        <hr /> */}

        <Switch>
          <Route exact path="/">
            <Map />
          </Route>
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/register">
            <Register />
          </Route>
          <Route exact path="/admin">
            <Admin />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}