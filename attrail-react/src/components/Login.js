import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "../css/Login.css";
import AuthDataService from "../services/auth.service";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [token, setToken] = useState("");

  function validateForm() {
    return email.length > 0 && password.length > 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    AuthDataService.login({
      email: email,
      password: password
    })
      .then(response => {
        setResult("Successful Login!")
        setToken(response.data.token)
      }
      ).catch(e => {
        console.log(e);
        if ( !e.response ) {
          setResult("Couldn't connect to the server");
        }
        else if ( e.response.status == 401 ){
          setResult("Incorrect User/Pass!")
        }
        else {
          setResult("There was a problem with logging in:\n" + e)
        }
      });
  }

  return (
    <div className="Login">
      <Form onSubmit={handleSubmit}>
        <h1>Login</h1>
        <Form.Group size="lg" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group size="lg" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button block size="lg" type="submit" disabled={!validateForm()}>
          Login
        </Button>
        <h5>
          {result}
        </h5>
        <div style={{overflowWrap: "break-word"}}>{token}</div>
      </Form>
    </div>
  );
}