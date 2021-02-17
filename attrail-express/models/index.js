const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.location = require("./locations.model.js")(mongoose);
db.atGeojson = require("./atgeojson.model.js")(mongoose);
db.atGeojsonReduced = require("./atgeojsonreduced.model.js")(mongoose);
db.user = require("./user.model.js")(mongoose);

module.exports = db;