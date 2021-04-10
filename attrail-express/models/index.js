const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
if ( process.env.DEVELOPMENT == 'true' ) {
    console.log("Connecting to dev database!")
    // db.url = dbConfig.devUrl;  
    db.url = dbConfig.url;  
}
else {
    console.log("Connecting to prod database!")
    db.url = dbConfig.url;  
}
db.location = require("./locations.model.js")(mongoose);
db.atGeojson = require("./atgeojson.model.js")(mongoose);
db.atGeojsonReduced = require("./atgeojsonreduced.model.js")(mongoose);
db.user = require("./user.model.js")(mongoose);
db.hikeDetails = require("./hike-details.model.js")(mongoose);

module.exports = db;