# uas-parser Change Log

## 0.2.3 - 2018-03-04

### Security
- Prevent regex denial of service attacks by only parsing the first 1,000 characters of the user agent string. Thanks to [@davisjam](https://github.com/davisjam). ([#5](https://github.com/GUI/uas-parser/pull/5))

## 0.2.2 - 2014-10-03

### Fixed
- Fix so this module doesn't keep node processes alive forever.

## 0.2.1 - 2014-09-19

### Security
- Upgrade "request" dependency to 2.44.0 (see [#3](https://github.com/GUI/uas-parser/pull/3)).

## 0.2.0 - 2013-10-27

### Added
- Return new devices information from user-agent-string.info. This
  categorizes the type of device for requests (PCs, tablets, phones, TVs, etc).

## 0.1.1 - 2013-08-02

### Fixed
-  Allow only 1 process to perform the automatic data update task
  concurrently. Helpful when used inside a cluster to prevent multiple
  processes from all trying to download the data simultaneously.

## 0.1.0 / 2013-06-16

- Initial release
