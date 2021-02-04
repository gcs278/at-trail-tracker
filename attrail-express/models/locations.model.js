module.exports = mongoose => {
    const Location = mongoose.model(
      "locations",
      mongoose.Schema(
        {
          "triggerData": {
            "isOnAT": {
              "type": "Boolean"
            }
          },
          "type": {
            "type": "String"
          },
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
            "timestamp": {
              "type": "Date"
            },
            "altitude": {
              "type": "Number"
            },
            "speed": {
              "type": "Number"
            },
            "horizontal_accuracy": {
              "type": "Number"
            },
            "vertical_accuracy": {
              "type": "Number"
            },
            "motion": {
              "type": [
                "String"
              ]
            },
            "pauses": {
              "type": "Boolean"
            },
            "activity": {
              "type": "String"
            },
            "desired_accuracy": {
              "type": "Number"
            },
            "deferred": {
              "type": "Number"
            },
            "significant_change": {
              "type": "String"
            },
            "locations_in_payload": {
              "type": "Number"
            },
            "battery_state": {
              "type": "String"
            },
            "battery_level": {
              "type": "Number"
            },
            "device_id": {
              "type": "String"
            },
            "wifi": {
              "type": "String"
            }
          }
        },
        { timestamps: true }
      )
      ,"locations"
    );
  
    return Location;
  };