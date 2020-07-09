const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");

router.get("/", (req, res) => {
  res.send("hello");
});

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    return res.status(422).send({ error: "please add all the fields" });
  }
  User.findOne({ email: email })
    .then(savedUser => {
      if (savedUser) {
        return res.status(422).send({ error: "user already exists" });
      }
      const user = new User({
        email,
        name,
        password
      });
      user.save()
        .then(user => {
          res.json({ message: "saved successfully" });
        })
        .catch(error => console.log(error));
    })
    .catch(error => console.log(error));
});

module.exports = router;