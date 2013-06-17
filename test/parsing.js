'use strict';

require('chai').should();

var uasParser = require('../');

describe('parse', function() {
  it('parses a browser', function() {
    var ua = uasParser.parse('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/536.26.17 (KHTML, like Gecko) Version/6.0.2 Safari/536.26.17');

    Object.keys(ua).length.should.eql(14);
    ua.type.should.eql('Browser');
    ua.uaFamily.should.eql('Safari');
    ua.uaName.should.eql('Safari 6.0.2');
    ua.uaUrl.should.eql('http://en.wikipedia.org/wiki/Safari_%28web_browser%29');
    ua.uaCompany.should.eql('Apple Inc.');
    ua.uaCompanyUrl.should.eql('http://www.apple.com/');
    ua.uaIcon.should.eql('http://user-agent-string.info/pub/img/ua/safari.png');
    ua.uaInfoUrl.should.eql('http://user-agent-string.info/list-of-ua/browser-detail?browser=Safari');
    ua.osFamily.should.eql('OS X');
    ua.osName.should.eql('OS X 10.7 Lion');
    ua.osUrl.should.eql('http://www.apple.com/osx/');
    ua.osCompany.should.eql('Apple Computer, Inc.');
    ua.osCompanyUrl.should.eql('http://www.apple.com/');
    ua.osIcon.should.eql('http://user-agent-string.info/pub/img/os/macosx.png');
  });

  it('parses a robot', function() {
    var ua = uasParser.parse('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)');

    Object.keys(ua).length.should.eql(14);
    ua.type.should.eql('Robot');
    ua.uaFamily.should.eql('bingbot');
    ua.uaName.should.eql('bingbot/2.0');
    ua.uaUrl.should.eql('http://www.bing.com/bingbot.htm');
    ua.uaCompany.should.eql('Microsoft Corporation');
    ua.uaCompanyUrl.should.eql('http://www.microsoft.com/');
    ua.uaIcon.should.eql('http://user-agent-string.info/pub/img/ua/bot_msnbot.png');
    ua.uaInfoUrl.should.eql('http://user-agent-string.info/list-of-ua/bot-detail?bot=bingbot');
    ua.osFamily.should.eql('unknown');
    ua.osName.should.eql('unknown');
    ua.osUrl.should.eql('unknown');
    ua.osCompany.should.eql('unknown');
    ua.osCompanyUrl.should.eql('unknown');
    ua.osIcon.should.eql('http://user-agent-string.info/pub/img/os/unknown.png');
  });

  it('parses a library', function() {
    var ua = uasParser.parse('curl/7.30.0');

    Object.keys(ua).length.should.eql(14);
    ua.type.should.eql('Library');
    ua.uaFamily.should.eql('cURL');
    ua.uaName.should.eql('cURL 7.30.0');
    ua.uaUrl.should.eql('http://curl.haxx.se/');
    ua.uaCompany.should.eql('team Haxx');
    ua.uaCompanyUrl.should.eql('http://www.haxx.se/');
    ua.uaIcon.should.eql('http://user-agent-string.info/pub/img/ua/curl.png');
    ua.uaInfoUrl.should.eql('http://user-agent-string.info/list-of-ua/browser-detail?browser=cURL');
    ua.osFamily.should.eql('unknown');
    ua.osName.should.eql('unknown');
    ua.osUrl.should.eql('unknown');
    ua.osCompany.should.eql('unknown');
    ua.osCompanyUrl.should.eql('unknown');
    ua.osIcon.should.eql('http://user-agent-string.info/pub/img/os/unknown.png');
  });

  it('parses an agent without a version number', function() {
    var ua = uasParser.parse('EventMachine HttpClient');

    Object.keys(ua).length.should.eql(14);
    ua.type.should.eql('Library');
    ua.uaFamily.should.eql('EventMachine');
    ua.uaName.should.eql('EventMachine');
    ua.uaUrl.should.eql('http://rubyeventmachine.com/');
    ua.uaCompany.should.eql('');
    ua.uaCompanyUrl.should.eql('');
    ua.uaIcon.should.eql('http://user-agent-string.info/pub/img/ua/DLLicon.png');
    ua.uaInfoUrl.should.eql('http://user-agent-string.info/list-of-ua/browser-detail?browser=EventMachine');
    ua.osFamily.should.eql('unknown');
    ua.osName.should.eql('unknown');
    ua.osUrl.should.eql('unknown');
    ua.osCompany.should.eql('unknown');
    ua.osCompanyUrl.should.eql('unknown');
    ua.osIcon.should.eql('http://user-agent-string.info/pub/img/os/unknown.png');
  });

  it('parses an agent with a hardcoded OS', function() {
    var ua = uasParser.parse('gvfs/1.3.1');

    Object.keys(ua).length.should.eql(14);
    ua.type.should.eql('Other');
    ua.uaFamily.should.eql('GnomeVFS');
    ua.uaName.should.eql('GnomeVFS 1.3.1');
    ua.uaUrl.should.eql('http://developer.gnome.org/doc/API/2.0/gnome-vfs-2');
    ua.uaCompany.should.eql('The GNOME Project');
    ua.uaCompanyUrl.should.eql('http://www.gnome.org/');
    ua.uaIcon.should.eql('http://user-agent-string.info/pub/img/ua/webdav.png');
    ua.uaInfoUrl.should.eql('http://user-agent-string.info/list-of-ua/browser-detail?browser=GnomeVFS');
    ua.osFamily.should.eql('Linux');
    ua.osName.should.eql('Linux');
    ua.osUrl.should.eql('http://en.wikipedia.org/wiki/Linux');
    ua.osCompany.should.eql('');
    ua.osCompanyUrl.should.eql('');
    ua.osIcon.should.eql('http://user-agent-string.info/pub/img/os/linux.png');
  });

  it('parses an unknown user agent', function() {
    var ua = uasParser.parse('gobbledygook');

    Object.keys(ua).length.should.eql(14);
    ua.type.should.eql('unknown');
    ua.uaFamily.should.eql('unknown');
    ua.uaName.should.eql('unknown');
    ua.uaUrl.should.eql('unknown');
    ua.uaCompany.should.eql('unknown');
    ua.uaCompanyUrl.should.eql('unknown');
    ua.uaIcon.should.eql('http://user-agent-string.info/pub/img/ua/unknown.png');
    ua.uaInfoUrl.should.eql('unknown');
    ua.osFamily.should.eql('unknown');
    ua.osName.should.eql('unknown');
    ua.osUrl.should.eql('unknown');
    ua.osCompany.should.eql('unknown');
    ua.osCompanyUrl.should.eql('unknown');
    ua.osIcon.should.eql('http://user-agent-string.info/pub/img/os/unknown.png');
  });
});
