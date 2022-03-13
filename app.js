var express = require("express");
var http = require("http");
var bodyParser = require("body-parser");
var passport = require("passport");
var authController = require("./auth");
var jwtController = require("./auth_jwt");
db = require("./db")();
var jwt = require("jsonwebtoken");
var cors = require("cors");
var exp = require("constants");

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
  .route("/signup")
  .post(function (req, res) {
    if (!req.body.username || !req.body.password) {
      res.json({
        success: false,
        msg: "Please include both username and password",
      });
    } else {
      var newUser = {
        username: req.body.username,
        password: req.body.password,
      };
      db.save(newUser);
      res.json({ success: true, msg: "Successfully created new user." });
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
    var user = db.findOne(req.body.username);
    if (!user) {
      res
        .status(401)
        .send({ success: false, msg: "Authentication failed, user not found" });
    } else {
      if (req.body.password == user.password) {
        var userToken = { id: user.id, username: user.username };
        var token = jwt.sign(userToken, process.env.SECRET_KEY);
        res.json({ success: true, token: "JWT " + token });
      } else {
        res.status(401).send({
          success: false,
          msg: "Authentication failed, incorrect password",
        });
      }
    }
  })

  .all(function (req, res) {
    res.json({
      success: false,
      msg: "Request type must be POST.",
    });
  });

router
  .route("/movies")

  .get(function (req, res) {
    res = res.status(200);
    if (req.get("Content-Type")) {
      res = res.type(req.get("Content-Type"));
    }

    var object = getJSONObject(req, "GET movies");
    res.json(object);
  })

  .post(function (req, res) {
    res = res.status(200);
    if (req.get("Content-Type")) {
      res = res.type(req.get("Content-Type"));
    }

    var object = getJSONObject(req, "movie saved");
    res.json(object);
  })

  .delete(authController.isAuthenticated, function (req, res) {
    console.log(req.body);
    res = res.status(200);
    if (req.get("Content-Type")) {
      res = res.type(req.get("Content-Type"));
    }

    var object = getJSONObject(req, "movie deleted");
    res.json(object);
  })
  .put(jwtController.isAuthenticated, function (req, res) {
    console.log(req.body);
    res = res.status(200);
    if (req.get("Content-Type")) {
      res = res.type(req.get("Content-Type"));
    }

    var object = getJSONObject(req, "movie updated");
    res.json(object);
  })

  .all(function (req, res) {
    res.json({
      success: false,
      msg: "Request type must be one of the following: GET, POST, PUT, or DELETE.",
    });
  });

router.route("/").all(function (req, res) {
  res = res.status(401).send({
    success: false,
    msg: "Request cannot be made to base address.",
  });
});

app.use("/", router);
app.listen(port, () => console.log(`Listening on port ${port}!`));
module.exports = app; // for unit testing ??
