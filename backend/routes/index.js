const express = require('express');
const Blog = require('../models/Blog');

const router = express.Router();


router.get('/', (req,res) => {
    res.render("welcome");
});

router.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if(err){
            console.log("ERROR!");
        } else {
           res.render("blogs", {blogs: blogs}); 
        }
    });
 });

 router.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id).populate("comments").exec( (err, foundBlog) => {
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("showBlog", {blog: foundBlog});
        }
    })
 });



module.exports = router;