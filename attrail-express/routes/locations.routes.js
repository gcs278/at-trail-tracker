module.exports = app => {
    const locations = require("../controllers/location.controller.js");
  
    var router = require("express").Router();
    var VerifyToken = require('../controllers/VerifyToken');

  
    // Create a new Tutorial
    router.post("/", VerifyToken, locations.create);
  
    // Retrieve all Tutorials
    router.get("/", VerifyToken, locations.findAll);

    router.get("/latest", VerifyToken, locations.findLatest);
  
    // Retrieve all published Tutorials
    router.get("/test", VerifyToken, locations.test);
    router.delete("/", VerifyToken, locations.resetLocations);
  
    // Get total distance hiked
    router.get("/stats", VerifyToken, locations.stats);

    router.post("/uploadAT", VerifyToken, locations.uploadAT);
    router.post("/uploadATReduced", VerifyToken, locations.uploadATReduced);

    router.get("/mytrack", VerifyToken, locations.getMyTrack);

    router.post("/hike-details", VerifyToken, locations.updateHikeDetails);
    router.post("/finish-date", VerifyToken, locations.updateFinishDate);

    app.use('/api/', VerifyToken, router);
  };