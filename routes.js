'use strict';
var userLocations = require('./src/githubApi').userLocations;

module.exports = function(app) {

    // Index page
    app.get('/', function(req, res) {
        console.log('here1!!!')
        res.sendFile(__dirname + '/views/index.html');
    });

    app.get('/locations/:user/:repo', function(req, res) {
        var user = req.params.user,
            repo = req.params.repo;
        res.setHeader('Content-Type', 'application/json');
        userLocations(user + '/' + repo).then(function(data) {
            Promise.all(data).then(function(promise_data) {
                return promise_data.filter(function(obj) {
                    return obj !== undefined
                })
            }).then(function(data) {
                res.send(JSON.stringify(data))
            })
        })
    })

    // Redirect to error page not found: 404
    app.get('*', function(req, res) {
        res.sendFile(__dirname + '/views/error.html');
    });
}