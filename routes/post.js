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
    .populate("comments.postedBy", "_id name")
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
      });
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
      });
    }
  });
});

router.put("/comment", requireLogin, (req, res) => {
  const comment = {
    text: req.body.text,
    postedBy: req.user._id
  };
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment }
    },
    {
      new: true
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      Post.find()
        .populate("comments.postedBy", "_id name")
        .then(posts => {
          res.json({ posts });
        });
    }
  });
});

router.delete("/deletepost/:postId", requireLogin, (req, res) => {
  Post.findOne({ _id: req.params.postId })
    .populate("postedBy", "_id")
    .exec((err, post) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else if (post.postedBy._id.toString() === req.user._id.toString()) {
        post
          .remove()
          .then(result => {
            res.json({ message: "successfully deleted" });
          })
          .catch(err => {
            console.log(err);
          });
      }
    });
});

router.get("/followedposts", requireLogin, (req, res) => {
  Post.find({ postedBy: { $in: req.user.following } })
    .populate("postedBy", "_id name") //Show the user info only the name & id
    .populate("comments.postedBy", "_id name")
    .then(posts => {
      res.json({ posts });
    })
    .catch(error => {
      console.log(error);
    });
});
module.exports = router;
