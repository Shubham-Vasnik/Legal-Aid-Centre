const isSignedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error_msg', "Please log in to view this resource");
    res.redirect('/users/login');
};

const isAdmin = (req,res,next) => {

    if(!req.isAuthenticated()){
        req.flash('error_msg', "Please log in to with admin account to view this resource");
        res.redirect('/admin/login');
    }
    else{

    if(req.user.role !== 'admin'){
        res.status(401);
        return res.send("Not allowed");
    }


    next();
}
};

module.exports = {
    isSignedIn,
    isAdmin
};