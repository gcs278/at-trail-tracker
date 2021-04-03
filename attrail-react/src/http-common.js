import axios from "axios";

export default function http() {
  return axios.create({
    baseURL: getUrl() + ":" + process.env.REACT_APP_EXPRESS_PORT + "/api",
    headers: {
      "Content-type": "application/json",
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
};

export var auth = axios.create({
  baseURL: getUrl() + ":" + process.env.REACT_APP_EXPRESS_PORT + "/auth",
  // headers: {
  //   "Content-type": "application/json"
  // }
});

function getUrl() {
  var foo = document.createElement("a");
  foo.href = window.location.origin.toString()
  foo.port = ""
  var newURL = foo.href.replace(/\/$/, "");
  return newURL
}