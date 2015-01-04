/*globals require, module, console */

'use strict';

var check, path, fs, defaults, defaultConfig;

check = require('check-types');
path = require('path');
fs = require('fs');

defaults = {
    uri: 'www.webpagetest.org',
    location: 'Dulles:Chrome',
    connection: 'Native Connection',
    tests: 'tests.json',
    count: 9,
    mapper: 'html-svg',
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
    normalise: normalise
};

function normalise (options) {
    if (!options.normalised) {
        clean(options);

        populateObject(options, readJSON(options.config, defaultConfig));

        options.log = getLog(options);

        populateObject(options, defaults);

        options.tests = getTests(options);
        options.results = getResults(options);
        options.mapper = getMapper(options);

        options.normalised = true;
    }
}

function clean (options) {
    var cruft = [ 'commands', 'options', 'rawArgs', 'args' ];

    Object.keys(options).forEach(function (key) {
        if (key[0] === '_') {
            cruft.push(key);
        }
    });

    cruft.forEach(function (key) {
        delete options[key];
    });
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
    var tests = readJSON(options.tests, defaults.tests);

    check.assert.array(tests, 'invalid option `tests`');

    return tests;
}

function getLog (options) {
    if (options.silent) {
        return undefined;
    }

    if (options.syslog) {
        initialiseSyslog(options.syslog);
        return console;
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

function initialiseSyslog (facility) {
    try {
        require('rconsole');

        console.set({
            facility: facility,
            title: 'webpagetest-mapper',
            stdout: true,
            stderr: true,
            showLine: false,
            showFile: false,
            showTime: true
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

function getMapper (options) {
    try {
        return require('./mappers/' + options.mapper);
    } catch (error) {
        return require(options.mapper);
    }
}

