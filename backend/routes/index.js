const express = require('express');
const Post = require('../models/Post');
const Activity = require('../models/Activity');

const router = express.Router();

// Home
router.get('/', (req,res) => {
    res.render("index");
});

// About
router.get('/about', (req,res) => {
    res.render("about");
});

// Who We Are
router.get('/whoweare', (req,res) => {
    res.render("whoWeAre");
});

// Contact
router.get('/contact', (req,res) => {
    res.render("contact");
});

// Blog

router.get("/blogs", (req, res) => {
    Post.find({}, (err, posts) => {
        if(err){
            console.log("ERROR!");
        } else {
           res.render("blog/postList", {posts:posts}); 
        }
    });
 });

 router.get("/blogs/:id", (req, res) => {
    Post.findById(req.params.id,(err, foundPost) => {
        console.log(foundPost);
        if(err){
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.render("blog/show", {post: foundPost});
        }
    })
 });

//  Activity

router.get("/activities", (req, res) => {
    Activity.find({}, (err, activities) => {
        if(err){
            console.log("ERROR!");
        } else {
           res.render("activity/list", {posts:activities}); 
        }
    });
 });

 router.get("/activities/:id", (req, res) => {
    Activity.findById(req.params.id,(err, foundActivity) => {
        if(err){
            console.log(err);
            res.redirect("/activities");
        } else {
            res.render("activity/show", {post: foundActivity});
        }
    })
 });




module.exports = router;