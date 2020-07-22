const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const Post = mongoose.model("Post");

router.post("/createpost", requireLogin, (req, res) => {
  const { title, body, pic } = req.body;
  if (!title || !body || !pic) {
    return res.status(422).json({ error: "please add all the fields" });
  }
  req.user.password = undefined; //remove the user password from the returned post
  const post = new Post({
    title,
    body,
    photo: pic,
    postedBy: req.user
  });
  post
    .save()
    .then(result => {
      res.json({ post: result });
    })
    .catch(error => {
      console.log(error);
    });
});

router.get("/allposts", requireLogin, (req, res) => {
  Post.find()
    .populate("postedBy", "_id name") //Show the user info only the name & id
    .then(posts => {
      res.json({ posts });
    })
    .catch(error => {
      console.log(error);
    });
});

router.get("/myposts", requireLogin, (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate("PostedBy", "_id name")
    .then(myPost => {
      res.json({ myPost });
    })
    .catch(error => {
      console.log(error);
    });
});

router.put("/like", requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id }
    },
    {
      new: true
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      Post.find().then(posts => {
        res.json({ posts });
      })
    }
  });
});

router.put("/unlike", requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id }
    },
    {
      new: true
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      Post.find().then(posts => {
        res.json({ posts });
      })
    }
  });
});
module.exports = router;
