# uas-parser

A user agent string parser for Node.js. Returns detailed user agent information from the [user-agent-string.info](http://user-agent-string.info) project.

The internal data used for parsing is automatically updated on weekly basis from [user-agent-string.info's](http://user-agent-string.info) latest downloads.

## Usage

### parse(userAgent)

Parse the given user agent string. Returns an object containing browser details and operating system information.

#### Examples

```js
var uaParser = require('uas-parser');

uaParser.parse('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/536.26.17 (KHTML, like Gecko) Version/6.0.2 Safari/536.26.17');
// { type: 'Browser',
//   uaFamily: 'Safari',
//   uaName: 'Safari 6.0.2',
//   uaUrl: 'http://en.wikipedia.org/wiki/Safari_%28web_browser%29',
//   uaCompany: 'Apple Inc.',
//   uaCompanyUrl: 'http://www.apple.com/',
//   uaIcon: 'http://user-agent-string.info/pub/img/ua/safari.png',
//   uaInfoUrl: 'http://user-agent-string.info/list-of-ua/browser-detail?browser=Safari',
//   osFamily: 'OS X',
//   osName: 'OS X 10.7 Lion',
//   osUrl: 'http://www.apple.com/osx/',
//   osCompany: 'Apple Computer, Inc.',
//   osCompanyUrl: 'http://www.apple.com/',
//   osIcon: 'http://user-agent-string.info/pub/img/os/macosx.png' }

uaParser.parse('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)');
// { type: 'Robot',
//   uaFamily: 'bingbot',
//   uaName: 'bingbot/2.0',
//   uaUrl: 'http://www.bing.com/bingbot.htm',
//   uaCompany: 'Microsoft Corporation',
//   uaCompanyUrl: 'http://www.microsoft.com/',
//   uaIcon: 'http://user-agent-string.info/pub/img/ua/bot_msnbot.png',
//   uaInfoUrl: 'http://user-agent-string.info/list-of-ua/bot-detail?bot=bingbot',
//   osFamily: 'unknown',
//   osName: 'unknown',
//   osUrl: 'unknown',
//   osCompany: 'unknown',
//   osCompanyUrl: 'unknown',
//   osIcon: 'http://user-agent-string.info/pub/img/os/unknown.png' }

uaParser.parse('EventMachine HttpClient');
// { type: 'Library',
//   uaFamily: 'EventMachine',
//   uaName: 'EventMachine undefined',
//   uaUrl: 'http://rubyeventmachine.com/',
//   uaCompany: '',
//   uaCompanyUrl: '',
//   uaIcon: 'http://user-agent-string.info/pub/img/ua/DLLicon.png',
//   uaInfoUrl: 'http://user-agent-string.info/list-of-ua/browser-detail?browser=EventMachine',
//   osFamily: 'unknown',
//   osName: 'unknown',
//   osUrl: 'unknown',
//   osCompany: 'unknown',
//   osCompanyUrl: 'unknown',
//   osIcon: 'http://user-agent-string.info/pub/img/os/unknown.png' }
```

### lookup(userAgent)

Provides the same functionality as `parse(userAgent)`, but caches the results for the given user agent string in memory. This can provide faster lookups when repeatedly parsing identical user agent strings.

The last 5,000 user agent strings seen will be cached. Cached results will remain valid for up to 1 week.

## Other User Agent Parsers

- [useragent](https://npmjs.org/package/useragent): Derived from [browserscope.org's](http://www.browserscope.org/) user agent parser. An excellent user agent parser for web browsers, but I found user-agent-string.info's data better at categorizing and dealing with robots, software libraries, and other more esoteric user agents (at least for my use case).

## Credits

All user agent data is from [user-agent-string.info](http://user-agent-string.info). Data is licensed under a [Creative Commons Attribution 3.0 Unported License](http://creativecommons.org/licenses/by/3.0/deed.en_US).
