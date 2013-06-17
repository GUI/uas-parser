'use strict';

var _ = require('underscore'),
    async = require('async'),
    crypto = require('crypto'),
    cache = require('../data/cache'),
    fs = require('fs'),
    lingo = require('lingo'),
    request = require('request'),
    util = require('util'),
    xregexp = require('xregexp').XRegExp;

var Updater = function() {
  this.initialize.apply(this, arguments);
};

module.exports = Updater;

_.extend(Updater.prototype, {
  cachePath: require.resolve('../data/cache'),
  updateInterval: undefined,

  dataUrl: 'http://user-agent-string.info/rpc/get_data.php?key=free&format=ini',
  versionUrl: 'http://user-agent-string.info/rpc/get_data.php?key=free&format=ini&ver=y',
  checksumUrl: 'http://user-agent-string.info/rpc/get_data.php?format=ini&sha1=y',

  initialize: function(updateInterval, callback) {
    this.updateInterval = updateInterval;
    this.updateCallback = callback;
    fs.stat(this.cachePath, this.handleFileStat.bind(this));
  },

  handleFileStat: function(error, stats) {
    if(error) {
      this.updateCallback(error);
      return false;
    }

    if(stats.mtime.getTime() < new Date().getTime() - this.updateInterval) {
      this.checkVersion();
    } else {
      this.updateCallback(null, cache);
    }
  },

  checkVersion: function() {
    console.info('[uas-parser] Checking user-agent-string.info for new version');
    request(this.versionUrl, this.handleCheckVersion.bind(this));
  },

  handleCheckVersion: function(error, response, body) {
    if(error) {
      this.updateCallback(error);
      return false;
    }

    if(cache && cache.version) {
      if(cache.version !== body) {
        this.download();
      } else {
        console.info('[uas-parser] Version up to date');
        this.updateCallback(null, cache);
      }
    } else {
      this.download();
    }
  },

  download: function() {
    console.info('[uas-parser] Downloading new data');
    async.parallel([
      this.downloadChecksum.bind(this),
      this.downloadData.bind(this),
    ], this.handleDownload.bind(this));
  },

  downloadChecksum: function(callback) {
    request(this.checksumUrl, function(error, response, body) {
      if(!error) {
        callback(null, body);
      } else {
        callback(error);
      }
    });
  },

  downloadData: function(callback) {
    request(this.dataUrl, function(error, response, body) {
      if(!error) {
        callback(null, body);
      } else {
        callback(error);
      }
    });
  },

  handleDownload: function(error, results) {
    if(error) {
      console.error('Download error: ', error);
      this.updateCallback(error);
      return false;
    } else {
      var checksum = results[0];
      var data = results[1];

      var dataChecksum = crypto.createHash('sha1').update(data, 'utf8').digest('hex');
      if(dataChecksum !== checksum) {
        console.error('Checksum mismatch (expected: ' + checksum + ', got: ' + dataChecksum + ')');
        this.updateCallback('Checksum mismatch');
        return false;
      } else {
        this.parseIni(data);
      }
    }
  },

  parseIni: function(contents) {
    var data = {};

    // Manually parse the ini file line by line. This isn't great, but the
    // parser depends on knowing the order of these entries, so it can check
    // them in order. This is based on how the existing Ruby library parses the
    // ini file.
    //
    // No node.js ini file parses seem to maintain the data's order. The XML
    // download, might be an easier alternative, but it seems to be missing
    // some fields (the robot's url, maybe others).
    var currentSection = 'unknown';
    var lines = contents.toString().split('\n');
    for(var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var optionMatches = line.match(/^(\d+)\[\]\s=\s"(.*)"$/);
      if(optionMatches) {
        var id = optionMatches[1];
        var value = optionMatches[2];

        if(!data[currentSection][id]) {
          data[currentSection][id] = [];
          data[currentSection].order.push(id);
        }

        data[currentSection][id].push(value);
      } else {
        var sectionMatch = line.match(/^\[(\S+)\]$/);
        if(sectionMatch) {
          currentSection = lingo.camelcase(sectionMatch[1].replace('_', ' '));
          data[currentSection] = {
            order: [],
          };
        } else {
          var versionMatch = line.match(/^; Version:\s*(\S+)\s*$/i);
          if(versionMatch) {
            data.version = versionMatch[1];
          }
        }
      }
    }

    // Mutate the data structure into one that's easier to query for parsing
    // purposes.
    this.updateOperatingSystems(data);
    this.updateRobots(data);
    this.updateBrowsers(data);
    this.updateBrowserTypes(data);
    this.updateBrowserOperatingSystems(data);
    this.updateBrowserRegexes(data);
    this.updateOperatingSystemRegexes(data);

    // Dump the data structure into a requireable javascript file that exports
    // the data.
    var cacheContents = 'module.exports = ' + util.inspect(data, {
      depth: null,
    }) + ';';

    fs.writeFile(this.cachePath, cacheContents, this.handleWriteData.bind(this));
  },

  handleWriteData: function(error) {
    console.info('[uas-parser] Installed new data');

    if(error) {
      this.updateCallback(error);
      return false;
    }

    // Refresh the cache out of the newly written file.
    delete require.cache[this.cachePath];
    cache = require(this.cachePath);

    this.updateCallback(null, cache);
  },

  updateOperatingSystems: function(data) {
    for(var i = 0; i < data.os.order.length; i++) {
      var id = data.os.order[i];
      var osArray = data.os[id];
      var os = {
        osFamily: osArray[0],
        osName: osArray[1],
        osUrl: osArray[2],
        osCompany: osArray[3],
        osCompanyUrl: osArray[4],
        osIcon: osArray[5],
      };

      this.compactObject(os);
      data.os[id] = os;
    }
  },

  updateRobots: function(data) {
    for(var i = 0; i < data.robots.order.length; i++) {
      var id = data.robots.order[i];
      var robotArray = data.robots[id];
      var robot = {
        userAgent: robotArray[0],
        metadata: {
          uaFamily: robotArray[1],
          uaName: robotArray[2],
          uaUrl: robotArray[3],
          uaCompany: robotArray[4],
          uaCompanyUrl: robotArray[5],
          uaIcon: robotArray[6],
          uaInfoUrl: robotArray[8],
        },
      };

      // Store the operating system metadata directly on the robot record,
      // since it's a hardcoded reference.
      var osId = robotArray[7];
      if(osId) {
        var os = data.os[osId];
        if(os) {
          robot.metadata = _.extend(robot.metadata, os);
        }
      }

      this.compactObject(robot.metadata);
      data.robots[id] = robot;
    }
  },

  updateBrowsers: function(data) {
    for(var i = 0; i < data.browser.order.length; i++) {
      var id = data.browser.order[i];
      var browserArray = data.browser[id];
      var browser = {
        typeId: browserArray[0],
        metadata: {
          uaFamily: browserArray[1],
          uaUrl: browserArray[2],
          uaCompany: browserArray[3],
          uaCompanyUrl: browserArray[4],
          uaIcon: browserArray[5],
          uaInfoUrl: browserArray[6],
        },
      };

      this.compactObject(browser.metadata);
      data.browser[id] = browser;
    }
  },

  updateBrowserTypes: function(data) {
    for(var i = 0; i < data.browserType.order.length; i++) {
      var id = data.browserType.order[i];
      data.browserType[id] = data.browserType[id][0];
    }
  },

  updateBrowserOperatingSystems: function(data) {
    for(var i = 0; i < data.browserOs.order.length; i++) {
      var id = data.browserOs.order[i];
      data.browserOs[id] = data.browserOs[id][0];
    }
  },

  updateBrowserRegexes: function(data) {
    for(var i = 0; i < data.browserReg.order.length; i++) {
      var id = data.browserReg.order[i];
      var browserRegArray = data.browserReg[id];
      var browserReg = {
        regexp: this.convertRegex(browserRegArray[0]),
        browserId: browserRegArray[1],
      };

      data.browserReg[id] = browserReg;
    }
  },

  updateOperatingSystemRegexes: function(data) {
    for(var i = 0; i < data.osReg.order.length; i++) {
      var id = data.osReg.order[i];
      var osRegArray = data.osReg[id];
      var osReg = {
        regexp: this.convertRegex(osRegArray[0]),
        osId: osRegArray[1],
      };

      data.osReg[id] = osReg;
    }
  },

  compactObject: function(obj) {
    _.each(obj, function(key, value) {
      if(!value) {
        delete obj[key];
      }
    });

    return obj;
  },

  convertRegex: function(regexString) {
    // Parse the regex string using the XRegExp library, since it supports the
    // /s (dotall) flag that's present in some of these regexes.
    var match = regexString.match(/^\/(.*)\/([gimynsx]*)\s*$/);
    var xregex = xregexp(match[1], match[2]);

    // XRegExp compiles to a native javascript regex, so pull that native
    // regexp back out, so the regex can easily be dumped to the cache file.
    match = xregex.toString().match(/^\/(.*)\/([gimy]*)$/);
    var regex = new RegExp(match[1], match[2]);

    return regex;
  },
});
