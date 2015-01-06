# webpagetest-mapper

[![Build status][ci-image]][ci-status]

Maps JSON result data
from [marcelduran/webpagetest-api][api]
into human-readable document formats.

* [Why would I want that?](#why-would-i-want-that)
* [How do I install it?](#how-do-i-install-it)
* [How do I use it?](#how-do-i-use-it)
	* [From the command line](#from-the-command-line)
    * [From a node.js project](#from-a-nodejs-project)
* [Is there a change log?](#is-there-a-change-log)
* [How do I set up the build environment?](#how-do-i-set-up-the-build-environment)
* [What license is it released under?](#what-license-is-it-released-under)

## Why would I want that?

Perhaps you'd like
to generate a report
containing sprauncy visualizations
of your website's performance.
Or maybe you want
to analyse all of the raw data behind
WebPageTest's median-based summaries
using a spreadsheet.

This tool can help you
do both of those things.
It can also be extended
to map WebPageTest result data
into any conceivable format.

## How do I install it?

If you're using npm:

```
npm install webpagetest-mapper --global
```

Or if you just want the git repo:

```
git clone git@github.com:nature/webpagetest-mapper.git
```

## How do I use it?

### From the command line

The executable name
is `wptmap`.

For command-line help,
run:

```
wptmap --help
```

Available options are:

* `--uri <URI>`:
  Base URI
  of the WebPageTest instance.
  The default is `www.webpagetest.org`.

* `--key <key>`:
  Your WebPageTest API key.

* `--location <location>`:
  The WebPageTest location.
  The default is `Dulles:Chrome`.

* `--connection <connection>`:
  The WebPageTest connection speed.
  The default is `Native Connection`.

* `--tests <path>`:
  Path to the test definitions file.
  The default is `tests.json`.
  [Example][eg-test].

* `--count <number>`:
  The number of times
  to run each test.
  The default is `9`.

* `--email <address>`:
  The email address to notify
  when tests are finished.

* `--output <path>`:
  File to write the mapped data to.
  The default is stdout.

* `--dump <path>`:
  Dump intermediate results to a file
  for later processing.
  Use this option
  if you need to run
  the same result data
  through more than one mapper.
  [Example][eg-dump].

* `--results <path>`:
  Read intermediate results from a file,
  and skip running the tests.
  Use this option
  if you have already used `--dump`
  and don't want to invoke WebPageTest
  to perform the tests again.
  [Example][eg-dump].

* `--mapper <path>`:
  The mapper to use.
  The default is `html-svg`.

* `--silent`:
  Disable logging.

* `--syslog <facility>`:
  Send log data to syslog,
  using the specified facility level.

* `--config <path>`:
  Attempt to read configuration options
  from a JSON file.
  The default is `.wptrc`.
  [Example][eg-config].

### From a node.js project

```javascript
var wpt = require('webpagetest-mapper');
```

Three functions are exported
from the main module:
`fetch`,
`map` and
`run`.
They each
take an options object
as their sole argument and
return an ES6 promise
representing their result.

#### fetch (options)

`fetch` asynchronously invokes WebPageTest
and returns an ES6 promise
that resolves to
the following data structure:

```javascript
{
	data: [ ... ],      // Result array from WebPageTest
	options: { ... },   // Cloned options object normalised with default values
	times: {
		begin: { ... }, // JavaScript Date instance representing the start time
		end: { ... }    // JavaScript Date instance representing the finish time
	}
}
```

The returned promise
is only resolved
when all of the tests
have completed.
It is never rejected.

Instead,
if any tests fail,
the equivalent item
in the `results.data` array
will have a property
called `error`
which contains
the `Error` instance.
Handling errors in this way
prevents rogue network errors
from failing an entire run,
while still propagating error information
for inspection by the caller.

`fetch` accepts
an options object
as its only argument,
supporting the following properties:

* `uri`:
  Base URI
  of the WebPageTest instance.
  The default is `www.webpagetest.org`.

* `key`:
  Your WebPageTest API key.

* `location`:
  The WebPageTest location.
  The default is `Dulles:Chrome`.

* `connection`:
  The WebPageTest connection speed.
  The default is `Native Connection`.

* `tests`:
  Path to the test definitions file.
  The default is `tests.json`.

* `count`:
  The number of times
  to run each test.
  The default is `9`.

* `email`:
  The email address to notify
  when tests are finished.

* `silent`:
  Disable logging.
  Overrides `syslog` and `log`.

* `syslog`:
  Send log data to syslog,
  using the specified facility level.
  Overrides `log`.

* `log`:
  Logging implementation.
  Needs the functions
  `log.info()`,
  `log.warn()` and
  `log.error()`.

* `config`:
  Attempt to read configuration options
  from a JSON file.
  The default is `.wptrc`.

##### Example

```javascript
wpt.run({
	uri: 'example.com',
	location: 'London:Firefox',
	tests: path.join(__dirname, 'tests.json'),
	count: 25,
	silent: true
}).then(function (result) {
	result.data.forEach(function (datum, index) {
		var id = '#' + index + ' [' + datum.name + ']';

		if (!datum.error) {
			return console.log('Test ' + id + ' passed: ' + datum.id);
		}

		console.log('Test ' + id + ' failed, reason: ' + datum.error.message);
	});
});
```

#### map (options)

##### Example

#### run (options)

`run` combines
the actions from
`fetch` and `map`,
asynchronously invoking WebPageTest
and returning a promise
that represents the mapped data.

It accepts
an options object
as its only argument,
supporting the aggregated properties
from `fetch` and `map`.

##### Example

```javascript
wpt.run({
	uri: 'example.com',
	location: 'London:Firefox',
	tests: path.join(__dirname, 'tests.json'),
	count: 25,
	mapper: 'odf-spreadsheet',
	silent: true
}).then(function (result) {
	fs.writeFileSync(path.join(__dirname, 'results.ods'));
}).catch(function (error) {
    console.log(error.stack);
    console.log('Fatal error, exiting');
	process.exit(1);
});
```

## Is there a change log?

[Yes][history].

## How do I set up the build environment?

The build environment relies on
node.js,
[JSHint],
[Mocha],
[Chai],
[Mockery] and
[Spooks].
Assuming that you already have node and NPM set up,
you just need to run `npm install` to
install all of the dependencies as listed in `package.json`.

You can lint the code
with the command `npm run lint`.

You can run the unit tests
with the command `npm test`.

## What license is it released under?

[GPL 3+][license]

Copyright © 2015 Nature Publishing Group

[ci-image]: https://secure.travis-ci.org/nature/webpagetest-mapper.png?branch=master
[ci-status]: http://travis-ci.org/#!/nature/webpagetest-mapper
[api]: https://github.com/marcelduran/webpagetest-api
[eg-test]: examples/tests.json
[eg-dump]: examples/dump.json
[eg-config]: examples/.wptrc
[history]: HISTORY.md
[jshint]: https://github.com/jshint/node-jshint
[mocha]: http://visionmedia.github.com/mocha
[chai]: http://chaijs.com/
[mockery]: https://github.com/mfncooper/mockery
[spooks]: https://github.com/philbooth/spooks.js
[license]: COPYING

