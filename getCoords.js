var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',

  // Optional depending on the providers 
  httpAdapter: 'https', // Default 
  //apiKey: '', // for Mapquest, OpenCage, Google Premier 
  formatter: null, // 'gpx', 'string', ... 
  language: 'english',
  email: 'jacobaronoff45@gmail.com'
};

var geocoder = NodeGeocoder(options);

function getLatLong(input) {
  return geocoder.geocode(input)
}
exports.getCoords = getLatLong