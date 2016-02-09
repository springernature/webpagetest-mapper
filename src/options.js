// Copyright © 2015 Springer Nature
//
// This file is part of webpagetest-mapper.
//
// Webpagetest-mapper is free software: you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option) any
// later version.
//
// Webpagetest-mapper is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
// details.
//
// You should have received a copy of the GNU General Public License along with
// webpagetest-mapper. If not, see <http://www.gnu.org/licenses/>.

/*globals require, module, console */

'use strict';

var check, path, fs, defaults, defaultConfig;

check = require('check-types');
path = require('path');
fs = require('fs');

defaults = {
    uri: 'www.webpagetest.org',
    key: undefined,
    location: 'Dulles:Chrome',
    connection: 'Native Connection',
    tests: 'tests.json',
    count: 9,
    email: undefined,
    wait: 600,
    output: undefined,
    dump: undefined,
    results: undefined,
    resultIds: undefined,
    mapper: 'html-comparison',
    silent: undefined,
    log: { info: nop, warn: nop, error: nop }
};

function nop () {}

defaultConfig = '.wptrc';

module.exports = {
    cli: [
        {
            format: '-u, --uri <URI>',
            description: 'the base URI of the WebPageTest instance, default is `' + defaults.uri + '`'
        },
        {
            format: '-k, --key <key>',
            description: 'the WebPageTest API key'
        },
        {
            format: '-l, --location <location>',
            description: 'the WebPageTest location, default is `' + defaults.location + '`'
        },
        {
            format: '-c, --connection <connection>',
            description: 'the WebPageTest connection speed, default is `' + defaults.connection + '`'
        },
        {
            format: '-t, --tests <path>',
            description: 'path to the test definitions file, default is `' + defaults.tests + '`'
        },
        {
            format: '-n, --count <number>',
            description: 'the number of times to run each test, default is `' + defaults.count + '`',
            coercion: parseInt
        },
        {
            format: '-e, --email <address>',
            description: 'the email address to notify when tests are finished'
        },
        {
            format: '-w, --wait <interval>',
            description: 'the number of seconds to wait between result fetch attempts, default is `' + defaults.wait + '`',
            coercion: parseInt
        },
        {
            format: '-o, --output <path>',
            description: 'the file to write the mapped output to, default is stdout'
        },
        {
            format: '-d, --dump <path>',
            description: 'dump intermediate results to a file for later processing'
        },
        {
            format: '-r, --results <path>',
            description: 'read intermediate results from a file, skips running the tests'
        },
        {
            format: '-i, --resultIds <ids>',
            description: 'comma-separated list of result ids to map, skips running the tests'
        },
        {
            format: '-m, --mapper <path>',
            description: 'the mapper to use, defaults to `' + defaults.mapper + '`'
        },
        {
            format: '-s, --silent',
            description: 'disable logging'
        },
        {
            format: '-y, --syslog <facility>',
            description: 'send logs to syslog, with the specified facility level'
        },
        {
            format: '-f, --config <path>',
            description: 'read configuration options from a file, default is `' + defaultConfig + '`'
        }
    ],
    normalise: normalise,
    get: {
        log: function () {
            return getLog.apply(null, arguments) || defaults.log;
        },
        results: getResults,
        mapper: getMapper
    }
};

function normalise (options) {
    var normalised;

    if (options.normalised) {
        return options;
    }

    normalised = {
        normalised: true
    };

    populateObject(options, readJSON(options.config, defaultConfig));

    Object.keys(defaults).forEach(function (key) {
        normalised[key] = options[key];
    });

    normalised.log = getLog(normalised);

    populateObject(normalised, defaults);

    normalised.tests = getTests(normalised);
    normalised.results = getResults(normalised);
    normalised.resultIds = getResultIds(normalised);
    normalised.mapper = getMapper(normalised);

    return normalised;
}

function readJSON (jsonPath, defaultFileName) {
    check.assert.unemptyString(defaultFileName);

    if (check.not.unemptyString(jsonPath)) {
        jsonPath = defaultFileName;
    }

    jsonPath = path.resolve(jsonPath);

    if (fs.existsSync(jsonPath) && fs.statSync(jsonPath).isFile()) {
        return JSON.parse(fs.readFileSync(jsonPath), { encoding: 'utf8' });
    }

    return {};
}

function populateObject (object, defaultValues) {
    check.assert.object(object, 'invalid options');
    check.assert.object(defaultValues, 'invalid options');

    Object.keys(defaultValues).forEach(function (key) {
        if (check.not.assigned(object[key])) {
            object[key] = defaultValues[key];
        }
    });
}

function getTests (options) {
    var tests = options.tests;

    if(! Array.isArray(tests)) {
        tests = readJSON(options.tests, defaults.tests);
    }
    
    if (!options.results && !options.resultIds) {
        check.assert.array(tests, 'invalid option `tests`');
    }

    return tests;
}

function getLog (options) {
    if (options.silent) {
        return undefined;
    }

    if (options.syslog) {
        return getSyslog(options.syslog);
    }

    if (options.log) {
        check.assert.object(options.log, 'invalid option `log`');
        check.assert.function(options.log.info, 'invalid option `log`');
        check.assert.function(options.log.warn, 'invalid option `log`');
        check.assert.function(options.log.error, 'invalid option `log`');

        return options.log;
    }

    return require('get-off-my-log').initialise('webpagetest-mapper', console.log);
}

function getSyslog (facility) {
    try {
        return new (require('ain2'))({
            tag: 'webpagetest-mapper',
            facility: facility
        });
    } catch (error) {
        throw new Error('failed to initialise syslog, ' + error.message);
    }
}

function getResults (options) {
    var results;

    if (check.unemptyString(options.results)) {
        results = readJSON(options.results, 'ignore');

        check.assert.object(results, 'invalid option `results`');
        check.assert.array(results.data, 'invalid option `results`');
        check.assert.object(results.options, 'invalid option `results`');
        check.assert.object(results.times, 'invalid option `results`');

        results.times.begin = new Date(results.times.begin);
        results.times.end = new Date(results.times.end);

        check.assert.date(results.times.begin, 'invalid option `results`');
        check.assert.date(results.times.end, 'invalid option `results`');
    }

    return results;
}

function getResultIds (options) {
    if (check.unemptyString(options.resultIds)) {
        return options.resultIds.split(',').map(function (resultId) {
            return { id: resultId };
        });
    }
}

function getMapper (options) {
    var mapper = options.mapper || defaults.mapper;

    try {
        return require('./mappers/' + mapper);
    } catch (error) {
        return require(mapper);
    }
}

