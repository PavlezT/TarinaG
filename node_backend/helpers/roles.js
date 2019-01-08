var db = require('../db');

var config = {
  roles_table : 'Golf_Roles'
}

var checkAuthInfo = (req) => {
    if(req.session.auth)
        return true;
    else
        return false;
}

exports.setRole = (req,res,next) =>{
    if(checkAuthInfo(req)){
        var auth = req.session.auth;
        
        return db.find({TableName : config.roles_table, Key : 'id', Value : parseInt(auth.roleid) })
            .then(role => {
                if( !(role && role[0]) ){
                    req.session.auth.admin = false;
                    throw new String('No such role:'+auth.roleid);
                }
                
                req.session.auth.admin = role[0].type == 'Administrator' ? true  : false;

                // if(req.session.auth.admin)
                //     next();
                // else
                //     throw new String('Don`t have permission');
            })
            // .catch(error => {
            //     console.log('<Check role> error:',error);
            //     // res.redirect('/');
            // });
    } else {
        return Promise.reject('There is no auth');
        // res.redirect('/');
    }
}

exports.checkRole = (req,res,next) =>{
    if(checkAuthInfo(req) && req.session.auth.admin){
        next();
    } else {
        console.log('<Check role> warning : Don`t have permission user with email:'+ req.session.auth.email);
        res.redirect('/');
    }
}

exports.checkAuthInfo = checkAuthInfo;