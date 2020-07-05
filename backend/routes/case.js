const express = require('express');
const { isSignedIn } = require('../middleware');

const Case = require('../models/Case');

const router = express.Router();


router.get('/new',isSignedIn, (req,res) => {
    res.render('cases/new');
});

router.post("/", isSignedIn, (req, res) => {

    let subject = req.body.subject;
    let details = req.body.details;
    let contactEmail= req.body.contactEmail;
    if(contactEmail === ""){
        contactEmail=req.user.email;
    }
    let mobileNo = req.body.mobileNo;
    let user = {
        id: req.user._id,
        name: req.user.firstName + " " + req.user.lastName,
    }
    const newCase = {subject,details,contactEmail,mobileNo,user}
    Case.create(newCase, (err, newCase)  => {
        if(err){
            console.log(err);
        } else {
            console.log(newCase);
            req.flash('success_msg', "Your case is Registered");
            res.redirect('/cases/new');
        }
    });
});

router.get('/', isSignedIn, (req, res) => {

    Case.find({"user.id":req.user.id}, (err, allCases) => {
        if(err){
            console.log(err);
        } else {
           res.render("cases/index",{allCases});
        }
     });
});

router.get("/:id", function(req, res){

   Case.findById(req.params.id, (err, foundCase) => {
        if(err){
            console.log(err);
        } else {
            console.log(foundCase)
            res.render("cases/show", {acase: foundCase});
        }
    });
});



module.exports = router;