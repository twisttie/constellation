var github = require('octonode');

var client = github.client('');
var ghrepo = client.repo('ocaml/ocaml');

function getAllStargazers(repo) {
	function inner_getter(index, user_data) {
		ghrepo.stargazers(index, 100, function(err, data, headers) {
			if(data.length == 0) {
				console.log(user_data);
				return user_data
			}
			else {
				console.log(index)
				return inner_getter(index+1, data.concat(user_data))
			}
		})
	}
	return inner_getter(1, [])
}
console.log(getAllStargazers('ocaml/ocaml'))