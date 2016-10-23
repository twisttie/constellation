'use strict';

var github = require('octonode');
var getCoords = require('./getCoords').getCoords
var Promise = require('bluebird')
var client = github.client(process.env.GITHUB_KEY);

function getAllUserLocationsForRepo(repo) {
    var ghrepo = client.repo(repo)
    var get_stargazers = Promise.promisify(ghrepo.stargazers, { context: ghrepo })

    function location_getter(user) {
        var user = client.user(user.login)
        var user_info = Promise.promisify(user.info, { context: user })
        return user_info().then(function(data, err, headers) {
            if (data === undefined || data.location == null) {
                return
            }
            return getCoords(data.location).then(function(res) {
                if (res === undefined || res[0] === undefined) {
                    return
                }
                return {
                    lat: res[0].latitude,
                    long: res[0].longitude
                }
            })
        })
    }

    function get_all_stargazers(index, user_data) {
        return get_stargazers(index, 100).then(function(data, err, headers) {
            return data
        }).then(function(data) {
            if (data.length == 0) {
                console.log("base case: " + user_data.length)
                return user_data.map(location_getter)
            } else {
                return get_all_stargazers(index + 1, data.concat(user_data))
            }
        })
    }
    return get_all_stargazers(1, [])
}
getAllUserLocationsForRepo('nchaulet/node-geocoder').then(function(data) {
    Promise.all(data).then(function(promise_data) {
        console.log(promise_data.filter(function(obj) {
            return obj !== undefined
        }))
    })
})
