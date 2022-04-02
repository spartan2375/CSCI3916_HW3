var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt-nodejs");

mongoose.Promise = global.Promise;

try {
  mongoose.connect(
    process.env.DB,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log("connected to mongodb from movies file")
  );
} catch (error) {
  console.log("could not connect from movies file");
}

//create user schema
var movieSchema = new Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true, min: 1900, max: 2030 },
  genre: {
    type: String,
    required: true,
    enum: [
      "Action",
      "Adventure",
      "Comedy",
      "Drama",
      "Fantasy",
      "Horror",
      "Mystery",
      "Thriller",
      "Western",
    ],
  },
  actors: [
    {
      actorName: String,
      CharacterName: String,
    },
  ],
  required: true,
});

// movieSchema.pre("save", function (next) {
//   var user = this;
//   //hash password
//   if (!user.isModified("password")) return next(); //if user didn't change password

//   //user did change password
//   bcrypt.hash(user.password, null, null, function (err, hash) {
//     if (err) return next(err);

//     //change the password to the hash
//     user.password = hash;
//     next();
//   });
// });

// userSchema.methods.comparePassword = function (password, callback) {
//   var user = this;

//   bcrypt.compare(password, user.password, function (err, isMatch) {
//     callback(isMatch);
//   });
// };

//return model to server
module.exports = mongoose.model("Movie", movieSchema);
