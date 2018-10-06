﻿const express = require('express');
const router = express.Router();
const userService = require('./user.service');

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.post('/search', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', update);
router.post('/bookmark', bookmark);
router.post('/upadepassword', upadepassword);
router.delete('/:id', _delete);
router.post('/resetpassword', resetpassword);
router.post('/singleUser', singleUser);
router.post('/socialRegister', socialRegister);

module.exports = router;

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    // res.send(req.body.username);
    userService.getAll(req.body.username)
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getAll(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function bookmark(req, res, next) {
    userService.bookmark(req.body.id, req.body.user)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function upadepassword(req, res, next) {
    userService.upadepassword(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function resetpassword(req, res, next) {
    // console.log(req.body);
    userService.resetpassword(req.body)
        .then((data) => res.send(data))
        .catch(err => next(err));
}

function singleUser(req, res, next) {
    userService.singleUser(req.body)
        .then((data) => res.send(data))
        .catch(err => next(err));
}

function socialRegister(req, res, next) {

    userService.socialRegister(req.body)
        .then((data) => {
            const credentials = {
                "username": data.username.split(' ').join('.').trim().toLowerCase(),
                "password": req.body.id
            };
            userService.authenticate(credentials)
            .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        })
        .catch(err => next(err));
}