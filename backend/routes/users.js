const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/User');

const router = express.Router();



router.get('/', (req,res) => {
    res.send("users");
});

router.get('/login', (req,res) => {
    res.render('users/login');
});

router.post('/login',(req, res, next) => {
    passport.authenticate('local',{
        successRedirect:'/',
        failureRedirect:'/users/login',
        failureFlash:true,
    })(req,res,next);
});

router.get('/register', (req,res) => {
    res.render('users/register');
});

router.post('/register', (req,res) => {
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
        res.render('users/register',{
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
                res.render('users/register',{
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
                    password
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

router.get('/logout',(req, res) => {
    req.logout();
    req.flash('success_msg', "You are logged out");
    res.redirect('/users/login');
});

module.exports = router;