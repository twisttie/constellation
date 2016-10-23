
var NodeGeocoder = require('node-geocoder');
var Promise = require('bluebird')

var options = {
  provider: 'openstreetmap',

  // Optional depending on the providers 
  httpAdapter: 'https', // Default 
  //apiKey: '', // for Mapquest, OpenCage, Google Premier 
  formatter: null, // 'gpx', 'string', ... 
  language: 'english',
  email: 'jacobaronoff45@gmail.com'
};

var geocoder = NodeGeocoder(options);

function getLatLong(location) {
  return Promise.promisify(geocoder.geocode, {context: geocoder})(location).then(function (res, err) {
    return res
  });
}
exports.getCoords = getLatLong
