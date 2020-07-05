const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/User');
const Case = require('../models/Case');

const router = express.Router();
const {isAdmin} = require('../middleware');

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


router.get('/logout',(req, res) => {
    req.logout();
    req.flash('success_msg', "You are logged out");
    res.redirect('/admin/login');
});


const escapeRegex = text => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



module.exports = router;