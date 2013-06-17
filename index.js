'use strict';

var _ = require('underscore'),
    cache = require('./data/cache'),
    LRU = require('lru-cache'),
    Updater = require('./lib/updater');

var updateInterval = 7 * 24 * 60 * 60 * 1000; // 7 days

function finalizeResult(result) {
  if(result.uaInfoUrl !== 'unknown') {
    result.uaInfoUrl = 'http://user-agent-string.info' + result.uaInfoUrl;
  }

  if(result.uaIcon !== 'unknown') {
    result.uaIcon = 'http://user-agent-string.info/pub/img/ua/' + result.uaIcon;
  }

  if(result.osIcon !== 'unknown') {
    result.osIcon = 'http://user-agent-string.info/pub/img/os/' + result.osIcon;
  }

  return result;
}

exports.parse = function(userAgent) {
  var result = {
    type: 'unknown',
    uaFamily: 'unknown',
    uaName: 'unknown',
    uaUrl: 'unknown',
    uaCompany: 'unknown',
    uaCompanyUrl: 'unknown',
    uaIcon: 'unknown.png',
    uaInfoUrl: 'unknown',
    osFamily: 'unknown',
    osName: 'unknown',
    osUrl: 'unknown',
    osCompany: 'unknown',
    osCompanyUrl: 'unknown',
    osIcon: 'unknown.png',
  };

  for(var i = 0; i < cache.robots.order.length; i++) {
    var robotId = cache.robots.order[i];
    var robot = cache.robots[robotId];

    if(robot.userAgent === userAgent) {
      result.type = 'Robot';
      result = _.extend(result, robot.metadata);
      return finalizeResult(result);
    }
  }

  var os;

  for(i = 0; i < cache.browserReg.order.length; i++) {
    var browserRegId = cache.browserReg.order[i];
    var browserReg = cache.browserReg[browserRegId];

    var matches = userAgent.match(browserReg.regexp);
    if(matches) {
      var browser = cache.browser[browserReg.browserId];
      if(browser) {
        result = _.extend(result, browser.metadata);

        var browserType = cache.browserType[browser.typeId];
        if(browserType) {
          result.type = browserType;
        }

        result.uaName = browser.metadata.uaFamily;
        if(matches[1]) {
          result.uaName += ' ' + matches[1];
        }
      }

      var osId = cache.browserOs[browserReg.browserId];
      if(osId) {
        os = cache.os[osId];
        if(os) {
          result = _.extend(result, os);
        }

        return finalizeResult(result);
      }

      break;
    }
  }

  for(i = 0; i < cache.osReg.order.length; i++) {
    var osRegId = cache.osReg.order[i];
    var osReg = cache.osReg[osRegId];

    if(osReg.regexp.test(userAgent)) {
      os = cache.os[osReg.osId];
      if(os) {
        result = _.extend(result, os);
      }

      break;
    }
  }

  return finalizeResult(result);
};

var lookupCache = LRU({
  max: 5000,
  maxAge: updateInterval,
});

exports.lookup = function(userAgent) {
  var cached = lookupCache.get(userAgent);
  if(!cached) {
    cached = exports.parse(userAgent);
    lookupCache.set(userAgent, cached);
  }

  return cached;
};

function updateData(callback) {
  new Updater(updateInterval, function(error, newCache) {
    if(!error) {
      cache = newCache;
    }

    if(callback) {
      callback(error);
    }
  });
}

updateData();
setInterval(updateData, updateInterval);
