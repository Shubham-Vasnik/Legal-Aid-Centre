const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require('multer');
const path = require('path');

const User = require('../models/User');
const Case = require('../models/Case');
const Post = require('../models/Post');
const Activity = require('../models/Activity');

const router = express.Router();
const {isAdmin} = require('../middleware');

const storage = multer.diskStorage({
    destination:'./public/uploads/postimages',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + req.user._id + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage:storage,
    limits:{fieldSize:10000000}
}).single('post-image');


router.use(upload);


// Auth
router.get('/', isAdmin, (req,res) => {
    res.send("Admin");
});

router.get('/login', (req,res) => {
    res.render('admin/login');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local',{
        successRedirect:'/admin',
        failureRedirect:'/admin/login',
        failureFlash:true,
    })(req,res,next);
});

router.get('/register',isAdmin, (req,res) => {
    res.render('admin/register');
});

router.post('/register',isAdmin, (req,res) => {
    const { firstName, lastName, email, password, password2 } = req.body;

    let errors = [];

    if(!firstName || !email || !password || !password2){
        errors.push({msg:"Please fill all required(*) fields"});
    }

    if(password !== password2){
        errors.push({msg:"Passwords do not match"});
    }

    if(password.length < 6){
        errors.push({msg:"Passwords should be atleast 6 characters"});
    }

    if(errors.length > 0){
        res.render('admin/register',{
            errors,
            firstName,
            lastName,
            email,
            password,
            password2,
        });
    }
    else{

        User.findOne({email}).then( user => {
            if(user){
                errors.push({msg:"Email is already registered"});
                res.render('admin/register',{
                    errors,
                    firstName,
                    lastName,
                    email,
                    password,
                    password2,
                });
            }
            else{
                const newUser = new User({
                    firstName,
                    lastName,
                    email,
                    password,
                    role:'admin',
                });

                bcrypt.genSalt(10,(err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err){
                            console.log(err);
                        }
                        else{
                            newUser.password = hash;
                            newUser.save()
                            .then( user => {
                                req.flash('success_msg', "You are now registered and can login");
                                res.redirect('login');
                            })
                            .catch( err => console.log(err) );
                        }
                        
                    })
                })
            }
        }) 
    }
    
});

// Cases

router.get('/cases', isAdmin, (req, res) => {

    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        console.log(regex);
        Case.find({"user.name":regex}, (err, allCases) => {
            console.log(allCases);
            if(err){
                console.log(err);
            } else {
               res.render('admin/allCases',{allCases});
            }
         });
    }
    else{
    Case.find({}, (err, allCases) => {
        if(err){
            console.log(err);
        } else {
           res.render('admin/allCases',{allCases});
        }
     });
    }
});

router.get('/cases/open', isAdmin, (req, res) => {

    Case.find({"status":"open"}, (err, allCases) => {
        if(err){
            console.log(err);
        } else {
           res.render('admin/allCases',{allCases});
        }
     });
});

router.get('/cases/closed', isAdmin, (req, res) => {

    Case.find({"status":"closed"}, (err, allCases) => {
        if(err){
            console.log(err);
        } else {
           res.render('admin/allCases',{allCases});
        }
     });
});

router.get('/cases/rejected', isAdmin, (req, res) => {

    Case.find({"status":"rejected"}, (err, allCases) => {
        if(err){
            console.log(err);
        } else {
           res.render('admin/allCases',{allCases});
        }
     });
});

router.get("/cases/:id", isAdmin, (req, res) => {

    if(req.query.status){

        Case.findById(req.params.id, (err, foundCase) => {
            if(err){
                console.log(err);
            } else {
                console.log(foundCase);
                let status = req.query.status;
                if(status === "open" || status === "closed" || status === "rejected" ){
                    foundCase.status = status;
                    foundCase.save();
                    res.render("cases/show", {acase: foundCase});
                }
            }
        });
    }
    else{
        Case.findById(req.params.id, (err, foundCase) => {
            if(err){
                console.log(err);
            } else {
                console.log(foundCase)
                res.render("cases/show", {acase: foundCase});
            }
        });
    }
 });


// Blog 

router.get("/blogs/new", isAdmin, (req, res) => {
    res.render("blog/new");
});

router.post("/blogs", isAdmin, (req, res) => {
    console.log(req.body)
    let title = req.body.title;
    let body = req.body.description;
    let author = req.user.firstName + " " + req.user.lastName;
    let image;
    upload(req, res, (err) => {
        if(err){
            req.flash('error_msg', "File Upload Error");
            res.redirect('/admin/blog/new');
            console.log(err);
        }
        else{
            if(req.file){
                image = "uploads/postimages/" + req.file.filename;
                }
            else{
                image="";
            }
            const newPost = {title,body,image,author}
            Post.create(newPost, (err, newPost) => {
                if(err){
                    res.render("blog/new");
                } else {
                    res.redirect("/blogs");
                }
            });
    }});
});

router.get("/blogs/:id/edit", isAdmin, (req, res) => {
    Post.findById(req.params.id, (err, foundPost) => {
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("blog/edit", {post: foundPost});
        }
    });
});

router.put("/blogs/:id", function(req, res){

    let title = req.body.title;
    let body = req.body.description;
    let image;
    upload(req, res, (err) => {
        if(err){
            req.flash('error_msg', "File Upload Error");
            res.redirect(`/admin/blogs/${req.params.id}/edit`);
            console.log(err);
        }
        else{
            if(req.file){
            image = "uploads/postimages/" + req.file.filename;
            }
            else{
                image="";
            }
            const post = {title,body,image}
    
            Post.findByIdAndUpdate(req.params.id, post, (err, updatedPost) => {
                if(err){
                    res.redirect("/blogs");
                }  else {
                    res.redirect("/blogs/" + req.params.id);
                }
            });
    }});
});

router.delete("/blogs/:id", (req, res) => {
    Post.findByIdAndRemove(req.params.id, (err) => {
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    })
 });


// Activity

router.get("/activities/new", isAdmin, (req, res) => {
    res.render("activity/new");
});

router.post("/activities", isAdmin, (req, res) => {
    let title = req.body.title;
    let body = req.body.description;
    let image;
    upload(req, res, (err) => {
        if(err){
            req.flash('error_msg', "File Upload Error");
            res.redirect('/admin/activities/new');
            console.log(err);
        }
        else{
            if(req.file){
                image = "uploads/postimages/" + req.file.filename;
                }
            else{
                image="";
            }
            const newActivity = {title,body,image}
            Activity.create(newActivity, (err, newPost) => {
                if(err){
                    res.render("activity/new");
                } else {
                    res.redirect("/activities");
                }
            });
    }});
});

router.get("/activities/:id/edit", isAdmin, (req, res) => {
    Activity.findById(req.params.id, (err, foundActivity) => {
        if(err){
            res.redirect("/activities");
        } else {
            res.render("activity/edit", {post: foundActivity});
        }
    });
});

router.put("/activites/:id", function(req, res){

    let title = req.body.title;
    let body = req.body.description;
    let image;
    upload(req, res, (err) => {
        if(err){
            req.flash('error_msg', "File Upload Error");
            res.redirect('/admin/activities/new');
            console.log(err);
        }
        else{
            if(req.file){
                image = "uploads/postimages/" + req.file.filename;
                }
            else{
                image="";
            }
            const activity = {title,body,image}
    
            Activity.findByIdAndUpdate(req.params.id, activity, (err, updatedPost) => {
                if(err){
                    res.redirect("/activities");
                }  else {
                    res.redirect("/activities/" + req.params.id);
                }
    })}
    });
});

router.delete("/activities/:id", (req, res) => {
    Activity.findByIdAndRemove(req.params.id, (err) => {
        if(err){
            res.redirect("/activities");
        } else {
            res.redirect("/activities");
        }
    })
 });

router.get('/logout',(req, res) => {
    req.logout();
    req.flash('success_msg', "You are logged out");
    res.redirect('/admin/login');
});


const escapeRegex = text => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



module.exports = router;