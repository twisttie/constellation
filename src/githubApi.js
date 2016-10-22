'use strict';

var github = require('octonode');
var getCoords = require('./getCoords').getCoords

var client = github.client(require('./secret'));

function getAllUserLocationsForRepo(repo, location_callback) {
    var ghrepo = client.repo(repo)

    function location_getter(user) {
        var user = client.user(user.login)
        user.info(function(err, data, headers) {
            if (data === undefined || data.location == null) {
                return
            }
            getCoords(data.location, function(err, res) {
                if (res === undefined || res[0] === undefined) {
                    return
                }
                location_callback(res[0].latitude, res[0].longitude)
            })
        })
    }

    function inner_getter(index, user_data) {
        ghrepo.stargazers(index, 100, function(err, data, headers) {
            if (err !== undefined) console.log(err)
            if (data === undefined) {
                console.log("undefined case: " + user_data.length)
                user_data.forEach(location_getter);
                return;
            } else if (data.length == 0) {
                console.log("base case: " + user_data.length)
                user_data.forEach(location_getter);
            } else {
                inner_getter(index + 1, data.concat(user_data))
            }
        })
    }
    inner_getter(1, [])
}
getAllUserLocationsForRepo('GJNilsen/YPDrawSignatureView', function(lat, long) {
    console.log("(" + lat + ", " + long + ")")
})
