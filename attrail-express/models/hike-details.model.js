module.exports = mongoose => {
    const hikeDetails = mongoose.model(
      "hike-details",
      mongoose.Schema(
        {
          "startDate": {
            "type": "String"
          },
          "finishDate": {
            "type": "String"
          }
        }
      )
      ,"hike-details"
    );
  
    return hikeDetails;
  };