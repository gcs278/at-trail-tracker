module.exports = mongoose => {
    const User = mongoose.model(
      "user",
      mongoose.Schema({  
          name: String,
          email: String,
          password: String,
          isAdmin: Boolean
      })
      ,"user"
      );
  
    return User;
  };