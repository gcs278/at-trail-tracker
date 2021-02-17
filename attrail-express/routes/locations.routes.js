module.exports = app => {
    const locations = require("../controllers/location.controller.js");
  
    var router = require("express").Router();
    var VerifyToken = require('../controllers/VerifyToken');

  
    // Create a new Tutorial
    router.post("/", VerifyToken, locations.create);
  
    // Retrieve all Tutorials
    router.get("/", locations.findAll);

    router.get("/latest", locations.findLatest);
  
    // Retrieve all published Tutorials
    router.get("/test", locations.test);
    router.get("/resetLocations", locations.resetLocations);
  
    // Get total distance hiked
    router.get("/stats", locations.stats);

    router.post("/uploadAT", locations.uploadAT);
    router.post("/uploadATReduced", locations.uploadATReduced);

    router.get("/mytrack", locations.getMyTrack);

    app.use('/api/', router);
  };