var express = require("express");
var bodyParser = require("body-parser");
var passport = require("passport");
var authController = require("./auth");
var jwtController = require("./auth_jwt");
var jwt = require("jsonwebtoken");
var cors = require("cors");
var exp = require("constants");
var User = require("./users");
var Movie = require("./movies");

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

var router = express.Router();

var port = process.env.PORT || 8080;
var uniq = process.env.UNIQUE_KEY;

function getJSONObject(req, msg) {
  var json = {
    headers: "No headers",
    key: process.env.UNIQUE_KEY,
    body: "No body",
    message: msg,
  };

  if (req.headers != null) json.headers = req.headers;
  if (req.body != null) json.body = req.body;
  return json;
}

router
  .route("/movies")
  .get(function (req, res) {})

  .post(jwtController.isAuthenticated, function (req, res) {
    if (!req.body.title || !req.body.year || !req.body.genre) {
      res.json({
        success: false,
        msg: "Please include a title, year, and genre!",
      });
    } else if (
      ![
        "Action",
        "Adventure",
        "Comedy",
        "Drama",
        "Fantasy",
        "Horror",
        "Mystery",
        "Thriller",
        "Western",
      ].includes(req.body.genre)
    ) {
      res.json({
        success: false,
        msg: "Genre must be on of the following: Action, Adventure, Comedy, Drama, Fantasy, Horror, Mystery, Thriller, or Western!",
      });
    } else {
      var movie = new Movie();
      movie.title = req.body.title;
      movie.year = req.body.year;
      movie.genre = req.body.genre;
      movie.actors = req.body.actors;
      console.log(req.body);
      movie.save();
      res.json({
        success: true,
        msg: "Successfully added (not really tho) movie to db",
      });
    }
  })

  .put(function (req, res) {})

  .delete(function (req, res) {});

router
  .route("/signup")
  .post(function (req, res) {
    if (!req.body.username || !req.body.password) {
      res.json({
        success: false,
        msg: "Please include both username and password",
      });
    } else {
      var user = new User();
      user.name = req.body.name;
      user.username = req.body.username;
      user.password = req.body.password;

      user.save(function (err) {
        if (err) {
          if (err.code == 11000)
            return res.json({
              success: false,
              message: "Duplicate Username!!!",
            });
          else return res.json(err);
        }
        console.log(req.body);
        res.json({ success: true, msg: "Successfully created new user." });
      });
    }
  })
  .all(function (req, res) {
    res.json({
      success: false,
      msg: "Request type must be POST.",
    });
  });

router
  .route("/signin")
  .post(function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username })
      .select("name username password")
      .exec(function (err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function (isMatch) {
          if (isMatch) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json({ success: true, token: "JWT " + token });
          } else {
            res.status(401).send({
              success: false,
              msg: "Authentication failed, incorrect password",
            });
          }
        });
      });
  })

  .all(function (req, res) {
    res.json({
      success: false,
      msg: "Request type must be POST.",
    });
  });

// router
//   .route("/movies")

//   .get(function (req, res) {
//     res = res.status(200);
//     if (req.get("Content-Type")) {
//       res = res.type(req.get("Content-Type"));
//     }

//     var object = getJSONObject(req, "GET movies");
//     res.json(object);
//   })

//   .post(function (req, res) {
//     res = res.status(200);
//     if (req.get("Content-Type")) {
//       res = res.type(req.get("Content-Type"));
//     }

//     var object = getJSONObject(req, "movie saved");
//     res.json(object);
//   })

//   .delete(authController.isAuthenticated, function (req, res) {
//     console.log(req.body);
//     res = res.status(200);
//     if (req.get("Content-Type")) {
//       res = res.type(req.get("Content-Type"));
//     }

//     var object = getJSONObject(req, "movie deleted");
//     res.json(object);
//   })
//   .put(jwtController.isAuthenticated, function (req, res) {
//     console.log(req.body);
//     res = res.status(200);
//     if (req.get("Content-Type")) {
//       res = res.type(req.get("Content-Type"));
//     }

//     var object = getJSONObject(req, "movie updated");
//     res.json(object);
//   })

//   .all(function (req, res) {
//     res.json({
//       success: false,
//       msg: "Request type must be one of the following: GET, POST, PUT, or DELETE.",
//     });
//   });

// router.route("/").all(function (req, res) {
//   res = res.status(401).send({
//     success: false,
//     msg: "Request cannot be made to base address.",
//   });
// });

app.use("/", router);
app.listen(port, () => console.log(`Listening on port ${port}!`));
module.exports = app; // for unit testing ??
