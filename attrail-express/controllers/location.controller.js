const db = require("../models");
const axios = require('axios').default;
const turf = require("turf");
// const distanceFunc = require('@turf/distance');
var length = require('@turf/length').default;
var distance = require('@turf/distance').default;
const moment = require("moment");
var VerifyToken = require('./VerifyToken');

const Location = db.location;
const atGeojson = db.atGeojson;
const atGeojsonReduced = db.atGeojsonReduced;
const AT_MILES = 2189
const maxDistanceOffTrail = 1609 // meters == 1 mile
  
// const stateDate = new Date(2021, 03, 28) 
// const startDate = "2021-03-28"
const startDate = "2021-01-28"

// Create and Save a new Tutorial
exports.create = (req, res) => {
    console.log(req.body)
    if ( Object.keys(req.body).length === 0 ) {
        res.send("ERROR: No data provided");
        return
    }
    Location.insertMany(req.body.locations)
    .then(result => {
        console.log(result)
        res.send({result:"ok"});
    })
    .catch(error => {
        console.error(error)
        res.send("ERROR");
    })
};

// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = { "properties.timestamp": { $exists: true }}

  Location.find(condition).sort({"properties.timestamp": -1})
    .then(data => {
        console.log(data)
        var coordinates = []
        data.forEach(function(item) {
            coordinates.push([item.geometry.coordinates[0],item.geometry.coordinates[1],0])
        });
        geojson = {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: { type: "LineString", coordinates: coordinates},
                    properties: { name: "mytrack", tessellate: false}
                }
            ]
        }
        res.send(geojson);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
};

// Find a single Tutorial with an id
exports.findOne = (req, res) => {
  
};

// Find a single Tutorial with an id
exports.findLatest = async (req, res) => {
    const title = req.query.title;
    var condition =  {"properties.timestamp": { $exists: true }}

    var lastLocation = await getMyLastLocation()
    if ( lastLocation ) {
        res.send(lastLocation);
    }
    else {
        res.status(500).send("No locations in the database");
    }
};


function calculateDistance(locations) {
    var lineString = []
    locations.forEach(function(item) {
        lineString.push([item.geometry.coordinates[0],item.geometry.coordinates[1]])
    });

    var line = turf.lineString(lineString);
    totalDistance = length(line, {units: 'miles'});
    totalDistance = Math.round(totalDistance * 100) / 100
    console.log(totalDistance)
    return totalDistance
}

function getDaysHiking() {
    var start = moment(startDate);
    var end = moment();
    var daysHiking = end.diff(start, "days")
    return daysHiking
}

function getDailyAverage(totalDistance) {
    var daysHiking = getDaysHiking()
    return totalDistance / daysHiking
}

async function getMyLastLocation() {
    var condition = { "properties.timestamp": { $exists: true }}
    const query = Location.find(condition).sort({"properties.timestamp": -1}).limit(1)
    const data = await query.exec()
    console.log("Last Location: " + data[0])

    return await obfuscateLocation(data[0])
}

async function obfuscateLocation(location) {
    if ( !location ) {
        return location;
    }

    if ( Array.isArray(location) ) {
        newLocations=[]
        location.forEach( function(item) {
            item.geometry.coordinates[0] = +location.geometry.coordinates[0].toFixed(1)
            item.geometry.coordinates[1] = +location.geometry.coordinates[1].toFixed(1)
            newLocations.push(item)
        });
        return newLocations
    }
    else {
        location.geometry.coordinates[0] = +location.geometry.coordinates[0].toFixed(1)
        location.geometry.coordinates[1] = +location.geometry.coordinates[1].toFixed(1)
        return location
    }
}

async function getAllLocations() {
    // Get Distance NOBO
    const query = Location.find({"properties.timestamp": -1})
    const data = await query.exec()
    return data
}

async function getClosestPointOnAT(coordinates) {
    // The maximum meters i can go off trail before we consider me "off" trail and not making progress
    // Get the latest location object with "isOnAT" trigger data
    const query = Location.find({triggerData: { isOnAT: true }}).sort({"properties.timestamp": -1}).limit(1)
    const data = await query.exec()
    if ( data.length == 0 ) {
        console.log("Could not get AT location. No Locations have ever been near AT.")
        return null
    }

    // Now Query for nearest AT Point
    const query2 = atGeojson.find({ "geometry": { $near: { $geometry: { type: "Point", coordinates: data[0].geometry.coordinates}, $maxDistance: maxDistanceOffTrail}}}).limit(1)
    const data2 = await query2.exec()

    console.log("AT Closest Point: " + data2[0])
    return data2[0]
}

// Get AT Geojson up until a certain point
async function getPartialATGeoJson(coordinates) {
 
    // Get the closest point for reduced geojson
    const query2 = atGeojsonReduced.find({ "geometry": { $near: { $geometry: { type: "Point", coordinates: coordinates}, $maxDistance: maxDistanceOffTrail}}}).limit(1)
    const data2 = await query2.exec()

    var start = new Date().getTime();

    const query = atGeojsonReduced.find( { $and:
        [
            { index: { $mod: [ 10, 0 ] } },
            { index: { $lt: data2[0].index} }
        ]
    })
    const data = await query.exec()

    var end = new Date().getTime();
    var time = end - start;
    console.log('Execution time: ' + time);

    return formatGeoJson(data)
}

function formatGeoJson(data) {
    coordinates = []
    data.forEach( function(item) {
        coordinates.push(item.geometry.coordinates)
    })
    var geojson = {
        "type":"FeatureCollection",
        "features": [ {
                "type":"Feature",
                "geometry": {
                    "type":"LineString",
                    "coordinates": coordinates
                }
            }]
        }
    return geojson
}

async function getIsOnTheAT() {
    // The maximum meters i can go off trail before we consider me "off" trail and not making progress
    const query = Location.find().sort({"properties.timestamp": -1}).limit(1)
    const data = await query.exec()
    isOnTheAt = data[0].triggerData.isOnAT
    console.log("Is On The AT: " + isOnTheAt)
    return isOnTheAt
}

async function getMyLastLocationYesterday() {
    yesterday_end = moment().subtract(1,'days').endOf('day').toDate()
    yesterday_start = moment().subtract(1,'days').endOf('day').toDate()

    const query = atGeojson.find({ "properties.timestamp": {$gt: yesterday_start, $lt: yesterday_end}}).sort({"properties.timestamp": -1})
    const data = await query.exec()
    console.log("Last Location Yesterday: " + data[0])
    return data[0]
}

exports.getMyTrack = async (req, res) => {
    var currentLocation = await getMyLastLocation()
    if ( ! currentLocation ) {
        res.send({})
        return
    }
    currentATLocation = await getClosestPointOnAT(currentLocation.geometry.coordinates)
    if ( currentATLocation ) {
        var geojson = await getPartialATGeoJson(currentATLocation.geometry.coordinates)
        // console.log("AT GEOJSON: " + JSON.stringify(geojson))
        res.send(geojson)
    }
    else {
        res.send({})
    }
}

// Update a Tutorial by the id in the request
exports.stats = async (req, res) => {
    const title = req.query.title;
    var condition = { "properties.timestamp": { $exists: true }}

    console.log("Gathering stats...")
    var totalDistance = null
    var todayDistance = null
    var dailyAverage = null
    var daysHiking = null
    var isOnTheAT  = false
    var percentDone = null
    var estimatedDaysRemaining = null
    var estimateCompletionDate = null
    var lastLocationTime = null

    var allLocations = await getAllLocations()
    if ( ! allLocations ) {
        res.status(500).send("An error occurred while fetching my locations");
        var currentLocation = await getMyLastLocation()
        if ( ! currentLocation ) {
            res.status(500).send("An error occurred while fetching the last location");
        }
        currentATLocation = await getClosestPointOnAT(currentLocation.geometry.coordinates)
        lastLocationTime = currentLocation.properties.timestamp
        isOnTheAT = await getIsOnTheAT()
        if ( currentATLocation ) {
            totalDistance = currentATLocation.properties.distanceNobo
            dailyAverage = getDailyAverage(totalDistance)
            totalDistance = totalDistance.toFixed(2)
            dailyAverage = dailyAverage.toFixed(2)

            // Distance from the AT
            var from = turf.point([currentATLocation.geometry.coordinates[0], currentATLocation.geometry.coordinates[1]])
            var to = turf.point([currentLocation.geometry.coordinates[0], currentLocation.geometry.coordinates[1]])
            var options = {units: 'miles'};
            var distanceFromTheAT = distance(from, to, options);
            distanceFromTheAT = distanceFromTheAT.toFixed(2)

            percentDone = ( totalDistance /  AT_MILES ) * 100
            percentDone = percentDone.toFixed(2)

            estimatedDaysRemaining = ( AT_MILES - totalDistance ) / dailyAverage
            estimatedDaysRemaining = estimatedDaysRemaining.toFixed(2)
            estimateCompletionDate = moment().add(estimatedDaysRemaining, 'days');
        }

        daysHiking = getDaysHiking()
        yesterdayLocation = await getMyLastLocationYesterday()
        if ( yesterdayLocation && currentLocation ) {
            yesterdayATLocation = await getClosestPointOnAT(yesterdayLocation.geometry.coordinates)
            todayDistance = totalDistance - yesterdayATLocation.properties.distanceNobo 
            todayDistance = todayDistance.toFixed(2)
        }

        console.log("Total Distance: " + totalDistance)
    }

    res.send({
        isOnTheAT: isOnTheAT,
        distanceFromTheAT: distanceFromTheAT,
        lastLocationTime: lastLocationTime,
        totalDistance : totalDistance,
        todayDistance : todayDistance,
        dailyAverage : dailyAverage,
        percentDone: percentDone,
        daysHiking: daysHiking,
        estimatedDaysRemaining: estimatedDaysRemaining,
        estimateCompletionDate: estimateCompletionDate
    });

};

// Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {
  
};

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
  
};

function uploadGeoJson(res, collection, file) {
    var fs = require('fs'),
    path = require('path'),    
    filePath = path.join(__dirname, file);

    fs.readFile(filePath, {encoding: 'utf-8'}, async function(err,data){
        if (!err) {
            // atGeojson.find({}).then( data => {
            //     console.log(data)
            //     res.send(data);
            // });


            // Clean up old AT
            const remove = collection.deleteMany({})
            const resultRemove = await remove.exec()
            // console.log(resultRemove)

            var points = []
            var previousPoint = null
            var previousDistanceNobo = null
            geojson = JSON.parse(data)
            var coordinates = null
            if ( geojson.features[0].geometry.type == "MultiLineString") {
                coordinates = geojson.features[0].geometry.coordinates[0]
            }
            else {
                coordinates = geojson.features[0].geometry.coordinates
            }
            index = 0
            coordinates.forEach( function(item) {
                distanceNobo = 0
                if ( previousPoint ) {
                    var from = turf.point([previousPoint[0], previousPoint[1]])
                    var to = turf.point([item[0], item[1]])
                    var options = {units: 'miles'};
                
                    var distanceFromLastPoint = distance(from, to, options);
                    distanceNobo = distanceFromLastPoint + previousDistanceNobo
                }
                console.log("Distance From Last Point: " + distanceFromLastPoint)
                console.log("Distance Nobo: " + distanceNobo)
                points.push({
                    geometry: {
                        type: "Point",
                        coordinates: [item[0], item[1]]
                    },
                    properties: {
                        distanceNobo: distanceNobo,
                        altitude: item[2]
                    },
                    index: index
                })
                previousPoint = item
                previousDistanceNobo = distanceNobo
                index = index + 1
            });
            
            var indexSplit = Math.round( points.length / 2 )
            var first = points.slice(0,indexSplit)
            var second = points.slice(indexSplit + 1)
            collection.insertMany(first)
            .then(result => {
                console.log(result)
                collection.insertMany(second)
                .then(result => {
                    console.log(result)
                    res.send("SUCCESS");
                })
                .catch(error => {
                    console.error(error)
                    res.send("ERROR");
                })
            })
            .catch(error => {
                console.error(error)
                res.send("ERROR");
            })
        } else {
            console.log(err);
        }
    });
}

exports.uploadAT = (req, res) => {
    uploadGeoJson(res, atGeojson,'../at_full.geojson')
}

exports.uploadATReduced = (req, res) => {
    uploadGeoJson(res, atGeojsonReduced,'../at_full_reduced.geojson')
}

exports.resetLocations = async (req, res) => {
    const query = Location.deleteMany({})
    const results = await query.exec()
    res.send("Reset Location Data");
}

// Find all published Tutorials
exports.test = async (req, res) => {
    index = 0;
    console.log("Uploading test location data")

    const query = Location.deleteMany({})
    const results = await query.exec()

    testCoordinates = [[-84.193892,34.62669,0],[-84.19435,34.629711,0],[-84.197478,34.633202,0],[-84.197,34.637454,0],[-84.192239,34.638077,0],[-84.191317,34.640149,0],[-84.191706,34.642196,0],[-84.190921,34.644916,0],[-84.192335,34.647632,0],[-84.193892,34.647893,0],[-84.195975,34.645978,0],[-84.198195,34.646658,0],[-84.197648,34.647101,0],[-84.198414,34.647405,0],[-84.198748,34.649073,0],[-84.199739,34.649786,0],[-84.197983,34.651142,0],[-84.197724,34.654075,0],[-84.196181,34.654042,0],[-84.195484,34.655727,0],[-84.192895,34.658086,0],[-84.184541,34.662307,0],[-84.183613,34.664431,0],[-84.180334,34.666605,0],[-84.176161,34.667421,0],[-84.1739,34.666811,0],[-84.168688,34.667175,0],[-84.166728,34.669103,0],[-84.165198,34.667763,0],[-84.162097,34.668662,0],[-84.160533,34.664718,0],[-84.159304,34.664194,0],[-84.157896,34.664702,0],[-84.153758,34.664522,0],[-84.151934,34.663109,0],[-84.149626,34.66299,0],[-84.147569,34.664219,0],[-84.144271,34.664101,0],[-84.1419,34.665614,0],[-84.138963,34.665282,0],[-84.138056,34.663363,0],[-84.136928,34.664675,0],[-84.135385,34.663316,0],[-84.130508,34.663224,0],[-84.12598,34.665201,0],[-84.125788,34.663879,0],[-84.119162,34.66068,0],[-84.117858,34.658425,0],[-84.113979,34.657824,0],[-84.109874,34.656045,0],[-84.106643,34.656282,0],[-84.104287,34.653848,0],[-84.102709,34.653257,0],[-84.103494,34.654208,0],[-84.102279,34.653557,0],[-84.102176,34.654017,0],[-84.100489,34.653499,0],[-84.095544,34.653812,0],[-84.093242,34.652387,0],[-84.091821,34.653058,0],[-84.088127,34.652181,0],[-84.08663,34.653144,0],[-84.082328,34.653156,0],[-84.082184,34.653853,0],[-84.080264,34.652667,0],[-84.080114,34.656129,0],[-84.078018,34.65744,0],[-84.075286,34.656608,0],[-84.069904,34.657231,0],[-84.068353,34.65613,0],[-84.068121,34.658869,0],[-84.065075,34.656673,0],[-84.06446,34.656888,0],[-84.063448,34.655884,0],[-84.061734,34.655586,0],[-84.056899,34.657091,0],[-84.056175,34.657955,0],[-84.053743,34.657644,0],[-84.051988,34.661687,0],[-84.047746,34.661744,0],[-84.047193,34.660647,0],[-84.048252,34.658876,0],[-84.046702,34.655812,0],[-84.044352,34.655465,0],[-84.042972,34.65442,0],[-84.041346,34.655203,0],[-84.037487,34.653707,0],[-84.036462,34.654261,0],[-84.035978,34.656059,0],[-84.034113,34.654731,0],[-84.032652,34.652269,0],[-84.03104,34.652721,0],[-84.028383,34.656823,0],[-84.028636,34.660146,0],[-84.027146,34.662088,0],[-84.028075,34.66303,0],[-84.027255,34.664279,0],[-84.030001,34.666392,0],[-84.027276,34.667204,0],[-84.024797,34.669302,0],[-84.021266,34.670142,0],[-84.018554,34.669954,0],[-84.016601,34.672937,0],[-84.010611,34.672612,0],[-84.009102,34.671214,0],[-84.007974,34.671392,0],[-84.005385,34.66996,0],[-84.003719,34.670999,0],[-84.004122,34.673066,0],[-84.001772,34.673909,0],[-84.00128,34.676207,0],[-84.000003,34.677577,0],[-83.996936,34.679022,0],[-83.998016,34.680688,0],[-83.997634,34.682189,0],[-83.99583,34.683498,0],[-83.995475,34.685381,0],[-83.994478,34.685717,0],[-83.995051,34.686,0],[-83.992995,34.688802,0],[-83.992122,34.693096,0],[-83.991295,34.693479,0],[-83.992067,34.696103,0],[-83.989874,34.698399,0],[-83.986288,34.700191,0],[-83.987074,34.701501,0],[-83.985694,34.701986,0],[-83.983946,34.704836,0],[-83.98413,34.707142,0],[-83.985332,34.707148,0],[-83.984649,34.709635,0],[-83.983379,34.709945,0],[-83.983024,34.713104,0],[-83.981029,34.715546,0],[-83.977129,34.715484,0],[-83.975374,34.718652,0],[-83.973502,34.71831,0],[-83.972423,34.71881,0],[-83.971351,34.72197,0],[-83.970251,34.722247,0],[-83.971966,34.722888,0],[-83.967874,34.724259,0],[-83.96295,34.728192,0],[-83.963209,34.729233,0],[-83.953975,34.731662,0],[-83.952452,34.735198,0],[-83.95045,34.735382,0],[-83.945704,34.740988,0],[-83.944262,34.740764,0],[-83.943648,34.74143,0],[-83.944515,34.743196,0],[-83.944228,34.745988,0],[-83.942917,34.742814,0],[-83.942821,34.743654,0],[-83.941469,34.741825,0],[-83.941175,34.742353,0],[-83.940082,34.740516,0],[-83.939625,34.741424,0],[-83.939187,34.740585,0],[-83.939037,34.741041,0],[-83.936571,34.739352,0],[-83.935909,34.735876,0],[-83.936728,34.735558,0],[-83.936305,34.734762,0],[-83.934973,34.735296,0],[-83.934154,34.73734,0],
    [-83.933075,34.737803,0],[-83.933307,34.737241,0],[-83.931947,34.738283,0],[-83.931517,34.737581,0],[-83.931019,34.738179,0],[-83.930964,34.736013,0],[-83.927241,34.735118,0],[-83.925151,34.736842,0],[-83.923567,34.736513,0],[-83.922153,34.73885,0],[-83.920172,34.738589,0],[-83.918239,34.734998,0],[-83.91619,34.735103,0],[-83.916197,34.734619,0],[-83.912455,34.734219,0],[-83.910098,34.73673,0],[-83.908499,34.735508,0],[-83.907584,34.732461,0],[-83.904456,34.731123,0],[-83.900747,34.732032,0],[-83.896315,34.729422,0],[-83.896574,34.728872,0],[-83.895987,34.729013,0],[-83.896376,34.728352,0],[-83.894081,34.725838,0],[-83.889252,34.725502,0],[-83.884792,34.726782,0],[-83.879321,34.723173,0],[-83.8776,34.723324,0],[-83.875141,34.725286,0],[-83.870544,34.727062,0],[-83.863892,34.726133,0],[-83.86217,34.723924,0],[-83.860272,34.723266,0],[-83.859063,34.723592,0],[-83.856392,34.721588,0],[-83.856262,34.722889,0],[-83.853564,34.723376,0],[-83.853079,34.724095,0],[-83.853694,34.724802,0],[-83.850402,34.724793,0],[-83.846809,34.72618,0],[-83.846003,34.725757,0],[-83.844405,34.726387,0],[-83.843981,34.725791,0],[-83.843695,34.726198,0],[-83.840286,34.724734,0],[-83.839084,34.725222,0],[-83.839842,34.726113,0],[-83.837527,34.72867,0],[-83.832965,34.729394,0],[-83.829966,34.730789,0],[-83.829727,34.736642,0],[-83.826742,34.743068,0],[-83.826114,34.749848,0],[-83.828374,34.753942,0],[-83.828361,34.756376,0],[-83.83002,34.759039,0],[-83.828962,34.76136,0],[-83.829208,34.763356,0],[-83.830943,34.766222,0],[-83.828805,34.768638,0],[-83.828682,34.771232,0],[-83.826257,34.773946,0],[-83.82705,34.775011,0],[-83.826305,34.776574,0],[-83.823347,34.777328,0],[-83.820602,34.780053,0],[-83.81968,34.779993,0],[-83.818703,34.781483,0],[-83.817282,34.781624,0],[-83.818054,34.78367,0],[-83.814837,34.78715,0],[-83.810206,34.79427,0],[-83.809837,34.793672,0],[-83.80772,34.793651,0],[-83.808553,34.795426,0],[-83.807795,34.795986,0],[-83.80925,34.7981,0],[-83.808676,34.79977,0],[-83.80677,34.801166,0],[-83.804824,34.80145,0],[-83.8069,34.80306,0],[-83.80593,34.804052,0],[-83.808335,34.805614,0],[-83.809715,34.804755,0],[-83.811114,34.806952,0],[-83.810507,34.807833,0],[-83.810787,34.810304,0],[-83.806094,34.812235,0],[-83.805971,34.81487,0],[-83.804592,34.81736,0],[-83.797817,34.821135,0],[-83.796054,34.823089,0],[-83.793247,34.822457,0],[-83.79143,34.823315,0],[-83.78419,34.820853,0],[-83.781349,34.821142,0],[-83.778849,34.822215,0],[-83.777373,34.821854,0],[-83.777435,34.818166,0],[-83.773364,34.816628,0],[-83.770605,34.81727,0],[-83.769491,34.816583,0],[-83.767428,34.81674,0],[-83.763317,34.814639,0],[-83.761493,34.814712,0],[-83.757976,34.812671,0],[-83.754581,34.812557,0],[-83.752784,34.808708,0],[-83.751255,34.808325,0],[-83.748202,34.805361,0],[-83.746986,34.805783,0],[-83.746009,34.805323,0],[-83.743933,34.800646,0],[-83.743264,34.802286,0],[-83.742813,34.80135,0],[-83.739971,34.802807,0],[-83.738551,34.802392,0],[-83.739159,34.802205,0],[-83.735477,34.80184,0],[-83.73433,34.803283,0],[-83.732226,34.803939,0],[-83.73213,34.799535,0],[-83.727199,34.797591,0],[-83.722384,34.798113,0],[-83.720594,34.794487,0],[-83.719337,34.79483,0],[-83.71569,34.792958,0],[-83.708484,34.791933,0],[-83.706264,34.793013,0],[-83.702207,34.79338,0],[-83.700595,34.792656,0],[-83.698225,34.793513,0],[-83.695883,34.792763,0],[-83.695247,34.79444,0],[-83.690746,34.799322,0],[-83.689551,34.798855,0],[-83.689182,34.800251,0],[-83.688595,34.799322,0],[-83.685822,34.801964,0],[-83.684537,34.802161,0],[-83.685118,34.801339,0],[-83.681949,34.800758,0],[-83.67852,34.802778,0],[-83.669361,34.805822,0],[-83.665153,34.808551,0],[-83.663692,34.810737,0],[-83.658767,34.813283,0],[-83.658692,34.814551,0],[-83.653262,34.821836,0],[-83.653884,34.823928,0],[-83.656267,34.825433,0],[-83.658678,34.830009,0],[-83.657736,34.831488,0],[-83.659218,34.833628,0],[-83.658938,34.837812,0],[-83.661178,34.843669,0],[-83.66096,34.847086,0],[-83.660235,34.848012,0],[-83.660953,34.850063,0],[-83.659676,34.851279,0],[-83.660584,34.852722,0],[-83.659751,34.856618,0],[-83.658378,34.857633,0],[-83.658214,34.859829,0],[-83.656848,34.860217,0],
    [-83.655632,34.86476,0],[-83.6568,34.867851,0],[-83.656295,34.871159,0],[-83.657265,34.872263,0],[-83.654533,34.87602,0],[-83.654464,34.878323,0],[-83.650673,34.88166,0],[-83.650161,34.883897,0],[-83.648174,34.884908,0],[-83.644164,34.891213,0],[-83.63898,34.892815,0],[-83.637061,34.892543,0],[-83.631979,34.893992,0],[-83.630252,34.892218,0],[-83.627663,34.900134,0],[-83.628414,34.901134,0],[-83.627396,34.900845,0],[-83.62655,34.905954,0],[-83.623687,34.908414,0],[-83.619767,34.909028,0],[-83.619091,34.912193,0],[-83.617321,34.913415,0],[-83.61446,34.912802,0],[-83.611509,34.913576,0],[-83.609487,34.912515,0],[-83.606919,34.912428,0],[-83.604378,34.910522,0],[-83.601974,34.912555,0],[-83.600636,34.912482,0],[-83.598232,34.915828,0],[-83.596012,34.916878,0],[-83.594932,34.919207,0],[-83.599994,34.925388,0],[-83.599775,34.928681,0],[-83.602001,34.932406,0],[-83.602336,34.937433,0],[-83.601585,34.938639,0],[-83.599474,34.939475,0],[-83.598423,34.941301,0],[-83.594686,34.94161,0],[-83.590486,34.946613,0],[-83.590445,34.948825,0],[-83.587958,34.950831,0],[-83.590424,34.95155,0],[-83.594386,34.954255,0],[-83.593894,34.956249,0],[-83.597118,34.959558,0],[-83.596134,34.961835,0],[-83.597268,34.961961,0],[-83.594126,34.963784,0],[-83.592952,34.965966,0],[-83.594803,34.967436,0],[-83.593901,34.970775,0],[-83.595779,34.976409,0],[-83.597063,34.977202,0],[-83.597186,34.980134,0],[-83.598511,34.982485,0],[-83.597295,34.984336,0],[-83.59942,34.986786,0],[-83.598751,34.99215,0],[-83.600164,34.993114,0],[-83.600014,34.994133,0],[-83.597753,34.994062,0],[-83.593164,34.996317,0],[-83.588813,35.00036,0],[-83.587685,35.000326,0],[-83.586825,35.001678,0],[-83.584441,35.002676,0],[-83.584338,35.006827,0],[-83.582706,35.007905,0],[-83.582897,35.012836,0],[-83.580425,35.013612,0],[-83.581627,35.016421,0],[-83.580752,35.017154,0],[-83.581634,35.017834,0],[-83.58134,35.021717,0],[-83.579059,35.023235,0],[-83.578294,35.024603,0],[-83.574968,35.026165,0],[-83.573806,35.026044,0],[-83.57132,35.027259,0],[-83.571887,35.029695,0],[-83.567769,35.030976,0],[-83.564169,35.033752,0],[-83.561669,35.036931,0],[-83.561369,35.040137,0],[-83.562844,35.042062,0],[-83.562721,35.043973,0],[-83.565166,35.046009,0],[-83.563848,35.048984,0],[-83.561519,35.048522,0],[-83.561082,35.046935,0],[-83.559648,35.046948,0],[-83.558391,35.045113,0],[-83.55891,35.043962,0],[-83.556847,35.041163,0],[-83.552715,35.039484,0],[-83.551636,35.042328,0],[-83.549621,35.042269,0],[-83.548439,35.043945,0],[-83.547476,35.04217,0],[-83.548214,35.040362,0],[-83.547538,35.039148,0],[-83.546178,35.039454,0],[-83.545823,35.040361,0],[-83.542982,35.04081,0],[-83.544799,35.038913,0],[-83.54404,35.037194,0],[-83.544,35.038452,0],[-83.542872,35.039228,0],[-83.543289,35.038498,0],[-83.542763,35.038775,0],[-83.542845,35.037818,0],[-83.540741,35.036636,0],[-83.537108,35.036291,0],[-83.53635,35.031858,0],[-83.530449,35.025536,0],[-83.523113,35.019683,0],[-83.519445,35.018103,0],[-83.520374,35.016468,0],[-83.521877,35.016054,0],[-83.521644,35.015299,0],[-83.522164,35.015678,0],[-83.522751,35.013063,0],[-83.521706,35.012596,0],[-83.521385,35.013107,0],[-83.520996,35.011538,0],[-83.522238,35.011706,0],[-83.522922,35.010488,0],[-83.524438,35.010777,0],[-83.525749,35.010105,0],[-83.52549,35.007789,0],[-83.523243,35.006538,0],[-83.519876,35.007202,0],[-83.519684,35.005868,0],[-83.518851,35.005477,0],[-83.517902,35.007196,0],[-83.516986,35.007474,0],[-83.515914,35.005092,0],[-83.513435,35.007564,0],[-83.512451,35.006928,0],[-83.512076,35.007414,0],[-83.510381,35.005313,0],[-83.50879,35.00526,0],[-83.509179,35.004553,0],[-83.507506,35.002341,0],[-83.504357,35.000707,0],[-83.501775,35.003714,0],[-83.499426,35.003215,0],[-83.496298,35.00028,0],[-83.493682,34.999207,0],[-83.48931,35.001954,0],[-83.488464,35.001234,0],[-83.487384,35.002255,0],[-83.487938,35.002814,0],[-83.486886,35.00725,0],[-83.486107,35.007557,0],[-83.484078,35.004432,0],[-83.482323,35.003346,0],[-83.479796,35.012155,0],[-83.480192,35.013668,0],[-83.477931,35.017647,0],[-83.477316,35.020388,0],[-83.478949,35.02264,0],[-83.478621,35.023742,0],[-83.480602,35.024664,0],[-83.482303,35.024237,0]]
    testCoordinates.push([-83.482303,37.024237,0])
    testData = []
    timeOffset = 0

    testCoordinates.forEach( async function (item) {
        var oldDateObj = new Date();
        var date = new Date(oldDateObj.getTime() + timeOffset*60);
        timeOffset++
        dateIso = date.toISOString();
        var data = {
            "locations": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        item[0] + ( ( Math.random() - 0.5) / 1000),
                        item[1] + ( ( Math.random() - 0.5) / 1000)
                    ],
                },
                "properties": {
                    "timestamp": dateIso,
                    "altitude": 0,
                    "speed": 4,
                    "horizontal_accuracy": 30,
                    "vertical_accuracy": -1,
                    "motion": ["driving","stationary"],
                    "pauses": false,
                    "activity": "other_navigation",
                    "desired_accuracy": 100,
                    "deferred": 1000,
                    "significant_change": "disabled",
                    "locations_in_payload": 1,
                    "device_id": "",
                    "wifi": "launchpad",
                    "battery_state": "charging",
                    "battery_level": 0.89
                }
            }
            ]
        };

        const postres = await axios.post('http://localhost:8080/api?token='+req.query.token, data);
        // console.log(postres)
    });
    res.send("Created:<br>" + JSON.stringify(testCoordinates, null, 2));

};