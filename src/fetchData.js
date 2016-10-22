'use strict';

const Promise = require('bluebird');
const vDOM = require('jsdom');
const Xray = require('x-ray');
const getCoords = require('./getCoords').getCoords
const x = Xray();

// constants
const STARGAZER_USER_URL_DOM_PATH = 'ol.follow-list li div h3 span a';
const STARGAZER_PAGINATION_DOM_PATH = '.pagination a';
const NEXT_PAGE_LINK_TEXT = 'Next';
const CHUNK_SIZE = 50;

// Mock data
const USERNAME = 'ocaml';
const PACKAGE_NAME = 'ocaml';
var pg = 1;

var start = new Date().getTime();

function getPromiseCall (url, stargazers) {
  return Promise.promisify(x(url, 'body@html'))().then(function (data) {
    return resolveStargazers(data, stargazers);
  });
}

// Starting point
x('https://github.com/'+USERNAME+'/'+PACKAGE_NAME+'/stargazers', 'body@html')
(function(err, data) {
  if (err) throw new Error(err);
  var stargazers = [];
  return resolveStargazers(data, stargazers);
});

const resolveStargazers = (data, stargazers) => {
  if (!data) if (err) throw new Error('data came back null in `resolveStargazers`');
  console.log('Loading stargazers (pg '+(pg++)+')...');
  vDOM.env(
    data,
    function (err, window) {
      if (err) throw new Error(err);
      if (window.document.querySelector('.container p').innerHTML.indexOf('abuse detection mechanism') > -1) {
        console.log('!!! Blocked by GitHub !!!');
        return;
      }
      var stargazersCount = window.document.querySelectorAll(STARGAZER_USER_URL_DOM_PATH).length;
      for (let i = 0; i < stargazersCount; i++) {
        stargazers.push(window.document.querySelectorAll(STARGAZER_USER_URL_DOM_PATH)[i].href);
      }
      var pageLinks = window.document.querySelectorAll(STARGAZER_PAGINATION_DOM_PATH).length;
      var nextPageURL = null;
      for (let i = 0; i < pageLinks; i++) {
        if (window.document.querySelectorAll(STARGAZER_PAGINATION_DOM_PATH)[i].innerHTML === NEXT_PAGE_LINK_TEXT) {
          nextPageURL = window.document.querySelectorAll(STARGAZER_PAGINATION_DOM_PATH)[i].href;
          break;
        }
      }
      if (nextPageURL) {
        getPromiseCall(nextPageURL, stargazers);
      } else {
        console.log('...done!')
        let end = new Date().getTime();
        let time = end - start;
        console.log('Found '+stargazers.length+' stargazers');
        console.log('This process took ~'+(time/1000)+'s\n');
        incrementallyLoadUserData(stargazers);
      }
    }
  );
}

/**
 * Partition users into chunks for incredmental loading of their locations,
 * instead of trying to load them all at once which will take a long time to
 * get any data back.
 * @param  {Array.string} stargazers Array of stargazing user urls.
 * @return {void}
 */
function incrementallyLoadUserData (stargazers) {
  var chunks = [];
  while (stargazers.length > CHUNK_SIZE) {
    chunks.push(stargazers.splice(0, CHUNK_SIZE));
  }
  if (stargazers.length > 0) {
    chunks.push(stargazers);
  }
  var promiseChunks = [];
  chunks.forEach((userUrls) => {
    promiseChunks.push(function (listOfChunks) {
      findAllLocations(userUrls, listOfChunks);
    });
  });
  console.log('Resolved '+promiseChunks.length+' chunks');

  var currentChunk = promiseChunks.shift();
  currentChunk(promiseChunks);
}

/**
 * Given an array of github user urls and a list of chunks left to resolve, we
 * find all the locations of the github user list and when we're all done, we
 * check to see if we have any more chunks to resolve and then move onto those.
 * @param  {Array.string}   userUrls     The list of github account urls.
 * @param  {Array.function} listOfChunks The list of chunks left to resolve.
 * @return {void}
 */
function findAllLocations (userUrls, listOfChunks) {
  console.log('Loading '+CHUNK_SIZE+' locations...');
  var promiseUsers = [];
  userUrls.forEach(function (url) {
    promiseUsers.push(
      Promise.promisify(x(url, 'li[itemprop="homeLocation"]'))().then(function(data) {
        return data || null;
      })
    );
  });
  Promise.all(promiseUsers).then(function(data) {
    var filteredData = data.filter(function (location) {
      if (location){
        getCoords(location, function(err, res) {
          if (err || !res || res === undefined) return (0, 0)
          if (res[0] === undefined) return (0, 0)
          return (res[0].latitude, res[0].longitude)
        });
      }
    });
    console.log('...done resolving chunk!');
  }).finally(function () {
    // do something before we move onto the next chunk
    var currentChunk = listOfChunks.shift();
    // If we have chunks left to resolve
    if (listOfChunks.length) {
      currentChunk(listOfChunks);
    } else {
      console.log('...done all chunking');
      var end = new Date().getTime();
      var time = end - start;
      console.log('Entire process took ~'+(time/1000)+'s');
    }
  });
}
