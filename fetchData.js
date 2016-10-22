'use strict';

const Promise = require('bluebird');
const vDOM = require('jsdom');
const Xray = require('x-ray');
const x = Xray();
const STARGAZER_DOM_PATH = 'ol.follow-list li div h3 span a';
const STARGAZER_DOM_ = 'ol.follow-list li div h3 span a';

// Mock data
const USERNAME = 'ocaml';
const PACKAGE_NAME = 'opam';

var start = new Date().getTime();
console.log('\nLoading stargazers...');

function getPromiseCall (url) {
  return Promise.promisify(x(url, 'body@html')().then(function (data) {

  }));
}

// Starting point
x('https://github.com/'+USERNAME+'/'+PACKAGE_NAME+'/stargazers', 'body@html')
(function(err, data) {
  if (err) throw new Error(err);
  if (!data) console.log('NULL DATA: ' + data);
  vDOM.env(
    data,
    function (err, window) {
      if (err) throw new Error(err);
      console.log('...done!');
      var stargazers = [];
      var stargazersCount = window.document.querySelectorAll(STARGAZER_DOM_PATH).length;
      for (let i = 0; i < stargazersCount; i++) {
        stargazers.push(window.document.querySelectorAll(STARGAZER_DOM_PATH)[i].href);
      }
      window.document.querySelectorAll(STARGAZER_DOM_PATH)
      // check for next page
    }
  );
});

// should strip of special characters (besides commas)
//  - "San Francisco, CA || ✈" -> "San Francisco, CA"
// findAllLocations(stargazers);

function findAllLocations (userUrls) {
  console.log('Loading locations...');
  var userPromises = [];
  userUrls.forEach(function (url) {
    userPromises.push(
      Promise.promisify(x(url, 'li[itemprop="homeLocation"]'))().then(function(data) {
        if (data) return data;
        return null;
      })
    );
  });

  Promise.all(userPromises).then(function(data) {
    var filteredData = data.filter(function (location) {
      if (location) return location;
    })
    console.log('...done!');
    var end = new Date().getTime();
    var time = end - start;
    console.log('Found '+userUrls.length+' users and '+filteredData.length+' locations\n');
    console.log('Entire process took ~'+time+'s');
    // console.log(filteredData);
  });
}
