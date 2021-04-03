const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const app = express();

var allowedOrigins = ["http://localhost:8081",
                      'http://thruhiketracker.com',
                      'https://thruhiketracker.com'];

const db = require("./models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

  app.use(cors({
    origin: function(origin, callback){
      // allow requests with no origin 
      // (like mobile apps or curl requests)
      if(!origin) return callback(null, true);
      if(allowedOrigins.indexOf(origin) === -1){
        var msg = 'The CORS policy for this site does not ' +
                  'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    }
  }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// // simple route
// app.get("/", (req, res) => {
//   res.json({ message: "Welcome to bezkoder application." });
// });

require("./routes/locations.routes.js")(app);
require("./routes/auth.routes.js")(app);


// set port, listen for requests
var PORT = process.env.PORT || 8080;

if ( process.env.DEVELOPMENT == 'true' ) {
  app.listen(PORT, () => {
    console.log(`Development Server is running on port ${PORT}.`);
  });
}
else {
  PORT = 8443;
  https.createServer({
    key: fs.readFileSync('/etc/ssl/private/thruhiketracker.key'),
    cert: fs.readFileSync('/etc/ssl/private/thruhiketracker.pem'),
  }, app)
  .listen(PORT, () => {
    console.log(`Production Server is starting on port ${PORT}.`);
  });
}