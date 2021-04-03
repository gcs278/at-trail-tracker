module.exports = mongoose => {
    const atGeojson = mongoose.model(
      "at-geojson",
      mongoose.Schema(
        {
          "geometry": {
            "type": {
              "type": "String"
            },
            "coordinates": {
              "type": [
                "Number"
              ]
            }
          },
          "properties": {
            "distanceNobo": {
              "type": "Number"
            },
            "altitude": {
              "type": "Number"
            },
            "totalAltitude": {
              "type": "Number"
            }
          },
          "index": {
            "type": "Number"
          }
        }
        ,
        { timestamps: true }
      )
      ,"at-geojson"
    );
  
    return atGeojson;
  };