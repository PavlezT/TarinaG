var roleHelper = require('./roles');

var checkAuthInfo = (req) => {
    // console.log('req.session:',req.session)
    if(req.session.auth)
        return true;
    else
        return false;
}

exports.checkAuth = (req,res,next) =>{
    if(checkAuthInfo(req))
        next();
    else {
        res.redirect('/');
    }
}

exports.authUser = (req,user) =>{
    req.session.cookie.maxAge = 1000*60*60*24*14 ;//milliseconds*seconds*minutes*hours*day
    req.session.auth = {
        userid : user.id,
        email : user.email,
        roleid : user.roleid,
        name : user.name,
        //admin : user.admin ? (user.admin == 'true' ? true : false) : false,
        created : new Date(Date.now())
    }

    return roleHelper.setRole(req);
}

exports.checkAuthInfo = checkAuthInfo;