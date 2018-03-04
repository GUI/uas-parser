'use strict';

var _ = require('lodash'),
    cache = require('./data/cache'),
    LRU = require('lru-cache'),
    Updater = require('./lib/updater');

var MAX_REASONABLE_LENGTH = 1000;
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

  if(result.deviceIcon !== 'unknown') {
    result.deviceIcon = 'http://user-agent-string.info/pub/img/device/' + result.deviceIcon;
  }

  if(result.deviceInfoUrl !== 'unknown') {
    result.deviceInfoUrl = 'http://user-agent-string.info' + result.deviceInfoUrl;
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
    deviceType: 'unknown',
    deviceIcon: 'unknown.png',
    deviceInfoUrl: 'unknown',
  };

  // Limit the parsed user agent to the first 1000 characters to prevent regex
  // denial of service attacks.
  if(userAgent.length > MAX_REASONABLE_LENGTH) {
    userAgent = userAgent.substr(0, 1000);
  }

  for(var i = 0; i < cache.robots.order.length; i++) {
    var robotId = cache.robots.order[i];
    var robot = cache.robots[robotId];

    if(robot.userAgent === userAgent) {
      result.type = 'Robot';
      result = _.extend(result, robot.metadata);
      _.extend(result, cache.device['1']);

      return finalizeResult(result);
    }
  }

  var osId;
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

      osId = cache.browserOs[browserReg.browserId];

      break;
    }
  }

  if(!osId) {
    for(i = 0; i < cache.osReg.order.length; i++) {
      var osRegId = cache.osReg.order[i];
      var osReg = cache.osReg[osRegId];

      if(osReg.regexp.test(userAgent)) {
        osId = osReg.osId;
        break;
      }
    }
  }

  if(osId) {
    var os = cache.os[osId];
    if(os) {
      result = _.extend(result, os);
    }
  }

  var device;
  if(result.type === 'Robot') {
    device = cache.device['1'];
  } else {
    for(i = 0; i < cache.deviceReg.order.length; i++) {
      var deviceRegId = cache.deviceReg.order[i];
      var deviceReg = cache.deviceReg[deviceRegId];

      if(deviceReg.regexp.test(userAgent)) {
        device = cache.device[deviceReg.deviceId];
        break;
      }
    }
  }

  if(!device) {
    if(['Other', 'Library', 'Validator', 'Useragent Anonymizer'].indexOf(result.type) !==  -1) {
      device = cache.device['1'];
    } else if(['Mobile Browser', 'Wap Browser'].indexOf(result.type) !==  -1) {
      device = cache.device['3'];
    } else {
      device = cache.device['2'];
    }
  }

  if(device) {
    result = _.extend(result, device);
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
var interval = setInterval(updateData, updateInterval);
interval.unref();
