'use strict';

require('chai').should();

var async = require('async'),
    sinon = require('sinon'),
    Updater = require('../lib/updater');

describe('updater', function() {
  it('only performs 1 check even if multiple updaters are created simultaneously', function(done) {
    var checkVersionSpy = sinon.spy(Updater.prototype, 'handleFileStat');

    async.times(5, function(id, callback) {
      new Updater(10000, function() {
        callback(null);
      });
    }, function() {
      checkVersionSpy.callCount.should.eql(1);
      done();
    });
  });
});
