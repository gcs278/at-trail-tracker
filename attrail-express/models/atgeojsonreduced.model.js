module.exports = mongoose => {
    const atGeojsonReduced = mongoose.model(
      "at-geojson-reduced",
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
            }
          },
          "index": {
            "type": "Number"
          }
        }
        ,
        { timestamps: true }
      )
      ,"at-geojson-reduced"
    );
  
    return atGeojsonReduced;
  };