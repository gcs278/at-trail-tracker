import axios from "axios";

export default function http() {
  return axios.create({
    baseURL: getUrl() + ":8080/api",
    headers: {
      "Content-type": "application/json",
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
};

export var auth = axios.create({
  baseURL: getUrl() + ":8080/auth",
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