const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const Post = mongoose.model("Post");
const User = mongoose.model("User");

router.get("/user/:id", requireLogin, (req, res) => {
  User.findOne({ _id: req.params.id })
    .select("-password")
    .then(user => {
      Post.find({ postedBy: req.params.id })
        .populate("postedBy", "_id name")
        .exec((err, posts) => {
          if (err) {
            return res.status(402).json({ error: err });
          }
          res.json({ user, posts });
        });
    })
    .catch(err => {
      return res.status(404).json({ error: "User not found" });
    });
});

router.put("/follow", requireLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.body.followId,
    {
      $push: { followers: req.user._id }
    },
    { new: true },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          $push: { following: req.body.followId }
        },
        { new: true }
      )
        .select("-password")
        .then(user => {
          Post.find({ postedBy: req.body.followId }).exec((err, posts) => {
            if (err) {
              return res.status(402).json({ error: err });
            }
            res.json({ user: result, posts });
          });
        })
        .catch(err => {
          return res.status(422).json({ error: err });
        });
    }
  );
});

router.put("/unfollow", requireLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.body.unfollowId,
    {
      $pull: { followers: req.user._id }
    },
    { new: true },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { following: req.body.unfollowId }
        },
        { new: true }
      )
        .select("-password")
        .then(user => {
          Post.find({ postedBy: req.body.followId }).exec((err, posts) => {
            if (err) {
              return res.status(402).json({ error: err });
            }
            res.json({ user: result, posts });
          });
        })
        .catch(err => {
          return res.status(422).json({ error: err });
        });
    }
  );
});

router.put("/updatepic", requireLogin, (req, res) => {
  console.log(req.body);
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { pic: req.body.pic } },
    { new: true },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      res.json(result);
    }
  );
});

router.put("/updateprofile", requireLogin, (req, res) => {
  const { name, pic } = req.body;
  if (!name || !pic) {
    return res.status(422).json({ error: "please add all the fields" });
  }
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { pic: req.body.pic, name: req.body.name} },
    { new: true },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      res.json(result);
    }
  );
});
module.exports = router;
