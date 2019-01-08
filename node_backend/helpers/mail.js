var mail = require('nodemailer');

var smpt_config = {
    host : 'email-smtp.us-west-2.amazonaws.com',
    port : 587,
    secure : false,
    auth : {
        user : 'AKIAJF7HHMY5WS7B4NVQ',
        pass : 'Ap5ClW5P8GUNNuA6NEjOnk0ZXD/80HMvTui8u6+umkHa'
    }
    // service : "Gmail",
    // auth : {
    //     user : "lizardsoftapps@gmail.com",
    //     pass : "lizard34soft56"
    // }
};
var transporter = mail.createTransport(smpt_config);
    // {
    // SES : new AWS.SES({
    //     apiVersion: '2010-12-01',
    //     region : 'us-west-2',
    //     endpoint : 'https://email-smtp.us-west-2.amazonaws.com',
    //     accessKeyId : '',
    //     secretAccessKey : ''
    // }
// )
    //
    //ses-smtp-user.20180113-200402
    //AKIAJF7HHMY5WS7B4NVQ
    //Ap5ClW5P8GUNNuA6NEjOnk0ZXD/80HMvTui8u6+umkHa
// })\
var mainEmail = "feedback@fairytalemagic.fi";//'nizavokir@gmail.com';
exports.mainEmail = mainEmail;
exports.sendMail = (to, subject,body) => {
    transporter.sendMail({
        from : mainEmail,
        to : to,
        subject : subject,
        html  : body
    })
}