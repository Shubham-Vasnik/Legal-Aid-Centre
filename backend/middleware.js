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

const checkCommentOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
           Comment.findById(req.params.comment_id, (err, foundComment) => {
              if(err){
                  res.redirect("back");
              }  else {
               if(foundComment.author.id.equals(req.user._id)) {
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that");
                   res.redirect("back");
               }
              }
           });
       } else {
           req.flash("error", "You need to be logged in to do that");
           res.redirect("back");
       }
   }

module.exports = {
    isSignedIn,
    isAdmin,
    checkCommentOwnership
};