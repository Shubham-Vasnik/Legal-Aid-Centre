const express = require("express");
const router  = express.Router({mergeParams: true});

const Blog = require("../models/Blog");
const Comment = require("../models/comment");
const middleware = require("../middleware");

// //Comments New
// router.get("/new",middleware.isSignedIn, (req, res) => {
//     console.log(req.params.id);
//     Blog.findById(req.params.id, function(err, blog){
//         if(err){
//             console.log(err);
//         } else {
//              res.render("comments/new", {campground: campground});
//         }
//     })
// });

//Comments Create
router.post("/",middleware.isLoggedIn, (req, res) => {
   Blog.findById(req.params.id, (err, blog) => {
       if(err){
           console.log(err);
           res.redirect("/blogs");
       } else {
        Comment.create(req.body.comment, (err, comment) => {
           if(err){
               req.flash("error", "Something went wrong");
               console.log(err);
           } else {
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               comment.save();
               blog.comments.push(comment);
               blog.save();
               console.log(comment);
               req.flash("success", "Successfully added comment");
               res.redirect('/blogs/' + blog._id);
           }
        });
       }
   });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
   Comment.findById(req.params.comment_id, (err, foundComment) => {
      if(err){
          res.redirect('/blogs');
      } else {
        res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
      }
   });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
      if(err){
          res.redirect('/blogs');
      } else {
          res.redirect("/blogs/" + req.params.id );
      }
   });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
       if(err){
           res.redirect('/blogs');
       } else {
           req.flash("success", "Comment deleted");
           res.redirect("/blogs/" + req.params.id);
       }
    });
});

module.exports = router;