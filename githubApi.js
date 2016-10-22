var github = require('octonode');
var getCoords = require('./getCoords').getCoords

var client = github.client(process.env.GITHUB_KEY);
var ghrepo = client.repo('ocaml/ocaml');

function getAllUserLocationsForRepo(repo) {
	function location_getter(user) {
		var user = client.user(user.login)
		user.info(function(err, data, headers) {
			if (data === undefined) return
			if (data.location != null) console.log(data.location)
		})
	}
	function inner_getter(index, user_data) {
		ghrepo.stargazers(index, 100, function(err, data, headers) {
			if (err !== undefined) console.log(err)
			if (data === undefined) {
				user_data.map(location_getter);
				return;
			}
			else if(data.length == 0) {
				user_data.map(location_getter);
			}
			else {
				inner_getter(index+1, data.concat(user_data))
			}
		})
	}
	inner_getter(1, [])
}
getAllUserLocationsForRepo('VansonLeung/react-native-keyboard-aware-view')