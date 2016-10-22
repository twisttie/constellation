var github = require('octonode');

var client = github.client('c485ee5c2e03ae3c18fb8d1444ccab752ddcf29d');
var ghrepo = client.repo('ocaml/ocaml');
var total = 0;
for (var i = 1; i <= 20; i++) {
    ghrepo.stargazers(i, 100, function(err, data, headers) {
        //console.log("error: " + err);
        //console.log("data: " + data);
        //console.log(data.length)
        total+=data.length;
        //console.log("remaining: ");
        //console.log(headers['x-ratelimit-remaining'])
		console.log(total)
    })
}