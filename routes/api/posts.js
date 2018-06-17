const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Post model
const Post = require("../../models/Post");
//Profile model
const Profile = require("../../models/Profile");

//validation
const validatePostInput = require("../../validation/post");

//Route Get api/posts/test
//Desc Test post route
// Access public
router.get("/test", (req, res) =>
  res.json({
    msg: "Posts Work"
  })
);

//Route: Get api/posts
//Desc: Get all posts
//Access: public
router.get("/", (req, res) => {
  Post.find()
    .sort({
      date: -1
    })
    .then(posts => res.json(posts))
    .catch(err =>
      res.json(400).json({
        nopostsfound: "No posts found"
      })
    );
});
/**************************************************/

//Route: Get api/posts/:id
//Desc: Get single post by id
//Access: public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.json(400).json({
        nopostfound: "No post found with that Id"
      })
    );
});
/**************************************************/

//Route: Post api/posts
//Desc: create a post
//Access: private
router.post(
  "/",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const {
      errors,
      isValid
    } = validatePostInput(req.body);
    //check validation
    if (!isValid) {
      //if any errors, send status 400 with errors
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);
/**************************************************/

//Route: DELETE api/posts/:id
//Desc: DELETE post
//Access: private
router.delete(
  "/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //check for post ownership
          if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
              notauthorized: "User not authorized"
            });
          }
          //if ownership is confirmed, delete post
          post.remove().then(() =>
            res.json({
              success: true
            })
          );
        })
        .catch(err =>
          res.status(404).json({
            postnofound: "No post found"
          })
        );
    });
  }
);
/**************************************************/

//Route: POST api/posts/like/:id
//Desc: Like post
//Access: private
router.post(
  '/like/:id',
  passport.authenticate('jwt', {
    session: false
  }),
  (req, res) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
            .length > 0
          ) {
            return res
              .status(400)
              .json({
                alreadyliked: "User already liked this post"
              });
          }
          //Add user id to likes array
          post.likes.unshift({
            user: req.user.id
          });
          //Save like to db
          post.save().then(post => res.json(post));
        })
        .catch(err =>
          res.status(404).json({
            postnotfound: "No post found"
          })
        );
    });
  }
);
/**************************************************/

//Route: POST api/posts/unlike/:id
//Desc: Unlike post
//Access: private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
            .length === 0
          ) {
            return res
              .status(400)
              .json({
                notliked: "You have not yet liked thid post"
              });
          }
          //get index to be removed
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);
          //splice out of array
          post.likes.splice(removeIndex, 1);
          //save
          post.save().then(post => rest.json(post));
        })
        .catch(err =>
          res.status(404).json({
            postnotfound: "No post found"
          })
        );
    });
  }
);
/**************************************************/

//Route: POST api/posts/comment/:id
//Desc: Add a comment on a post
//Access: private
router.post('/comment/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  const {
    errors,
    isValid
  } = validatePostInput(req.body);
  //check validation
  if (!isValid) {
    //if any errors, send status 400 with errors
    return res.status(400).json(errors);
  }

  Post.findById(req.params.id).then(post => {
      const newComment = {
        text: req.body.text,
        name: req.user.name,
        avatar: req.user.avatar,
        user: req.user.id
      }
      //Add to comments array
      post.comments.unshift(newComment);
      //save
      post.save().then(post => res.json(post))
    })
    .catch(err => res.status(404).json({
      postnotfound: 'No post found'
    }));
});

/************************************************ */

//Route: DELETE api/posts/comment/:id/comment_id
//Desc:  Delete comment
//Access: private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Post.findById(req.params.id).then(post => {
      //check to see if comment exists
      if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
        return res.status(404).json({
          commentnotfound: 'Comment not found'
        });
      }
      //get the index to be removed
      const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);
      //splice comment out of array
      post.comments.splice(removeIndex, 1);
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({
      postnotfound: 'No post found'
    }));
});

/************************************************ */
module.exports = router;