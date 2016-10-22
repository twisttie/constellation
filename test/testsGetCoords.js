var assert = require('assert');
var getCoords = require('../getCoords').getCoords;

describe('#getLatLong()', function() {

    it('should have one item', function() {
        getCoords('Boston, MA').then(function(data) {
            data.length.should.equal(1)
        })
    })
    it('should have the proper lat, lang', function() {
        getCoords('Boston, MA').then(function(data) {
            data[1].latitude.should.equal(42.3600825)
            data[1].longitude.should.equal(-71.0588801)
        })
    })
    it('should return nothing', function() {
        getCoords('foobarbaz').then(function(data) {
        	data.length.should.equal(0)
        })
    })
})
