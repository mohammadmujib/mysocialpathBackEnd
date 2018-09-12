﻿var nodemailer = require('nodemailer');
const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
var generator = require('generate-password');
const User = db.User;

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    resetpassword
};

async function authenticate({ username, password }) {
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.hash)) {
        const { hash, ...userWithoutHash } = user.toObject();
        const token = jwt.sign({ sub: user.id }, config.secret);
        return {
            ...userWithoutHash,
            token
        };
    }
}

async function getAll(username) {
    return await User.find({ 'username':  {'$regex' : username} }).select('-hash');
}

async function getById(id) {
    return await User.findById(id).select('-hash');
}

async function create(userParam) {
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}

async function resetpassword({ username }) {
    const userexists = await User.findOne({ username });
    if (!userexists) throw 'User not found';
    const password = generator.generate({
                        length: 10,
                        numbers: true
                    });
    userexists.hash = bcrypt.hashSync(password, 10);
    const output = `
        <p>You have new contect request</p>
        <h3>here you go</h3>
        <h3>${userexists.email}</h3>
        <h3>${ password }</h3>

    `;
    let transporter = nodemailer.createTransport({
        service: 'Godaddy',
        host: 'smtpout.asia.secureserver.net',
        port: 465,
        secureConnection: true, // true for 465, false for other ports
        auth: {
            user: "admin@mysocialpath.com", // generated ethereal user
            pass: "4078#Admin" // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"mysocialPath" <admin@mysocialpath.com>', // sender address
        to: userexists.email, // list of receivers
        subject: 'Password Reset', // Subject line
        text: 'We found it', // plain text body
        html: output // html body
    };
    Object.assign(userexists, userexists);

    await userexists.save();
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log(user);
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    });

}