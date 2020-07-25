const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../keys");
const requireLogin = require("../middleware/requireLogin");

router.get("/user", requireLogin, (req, res) => {
  User.findById(req.user.id)
    .select("-password")
    .then(user => res.json(user));
});

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    return res.status(422).json({ error: "please add all the fields" });
  }
  User.findOne({ email: email })
    .then(savedUser => {
      if (savedUser) {
        return res.status(422).send({ error: "user already exists" });
      }
      bcrypt.hash(password, 12).then(hashedPassword => {
        const user = new User({
          email,
          name,
          password: hashedPassword
        });
        user
          .save()
          .then(user => {
            const token = jwt.sign({ _id: user._id }, JWT_SECRET);
            const { _id, name, email } = user;
            res.json({ token, user: { _id, name, email } });
          })
          .catch(error => console.log(error));
      });
    })
    .catch(error => console.log(error));
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(422)
      .json({ error: "Please enter correct email and password" });
  }
  User.findOne({ email: email }).then(savedUser => {
    if (!savedUser) {
      res.status(402).json({ error: "Invalid Email and/or password" });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then(doMatch => {
        if (doMatch) {
          //   res.json({ message: "success" });
          const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
          const { _id, name, email, followers, following } = savedUser;
          res.json({ token, user: { _id, name, email, followers, following } });
        } else {
          return res
            .status(402)
            .json({ error: "Invalid Email and/or password" });
        }
      })
      .catch(error => {
        console.log(error);
      });
  });
});

module.exports = router;
