const db = require("../models");
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
require('dotenv').config();

const User = db.user;

// Create and Save a new Tutorial
exports.create = (req, res) => {
    console.log(req.body)
    Location.insertMany(req.body.locations)
    .then(result => {
        console.log(result)
        res.send("SUCCESS");
    })
    .catch(error => {
        console.error(error)
        res.send("ERROR");
    })
};

exports.login = async (req, res) => {
    User.findOne({ email: req.body.email }, function (err, user) {
      if (err) return res.status(500).send('Error on the server.');

      // No user found
      if (!user) return res.status(401).send({ auth: false, token: null });
      
      // check if the password is valid
      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
  
      // if user is found and password is valid
      // create a token
      var token = jwt.sign({ id: user._id }, process.env.SECRET, {
        expiresIn: 31556952 // expires in 1 year
      });
  
      // return the information including token as JSON
      res.status(200).send({ auth: true, token: token });
    });
} 

exports.register = async (req, res) => {
    if ( ! req.body.name ) {
      res.status(500).send("ERROR: You need to provide registration data")
    }
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    
    User.create({
      name : req.body.name,
      email : req.body.email,
      password : hashedPassword
    },

    function (err, user) {
      if (err) return res.status(500).send("There was a problem registering the user.")
      res.status(200).send({ auth: true});
    }); 
}