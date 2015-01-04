/*globals require, module, Promise */

'use strict';

var fs, path, normalise, wpt;

require('es6-promise').polyfill();
fs = require('fs');
path = require('path');
normalise = require('./options').normalise;
wpt = require('./webpagetest');

module.exports = {
    run: run,
    fetch: fetch,
    map: map
};

/**
 * Public function `run`.
 *
 * Invokes WebPageTest then maps the result data, returns an ES6 promise.
 *
 * @option uri        {string}  Base URI for the WebPageTest instance, defaults to
 *                              `www.webpagetest.org`.
 * @option key        {string}  WebPageTest API key.
 * @option location   {string}  WebPageTest location, defaults to `Dulles:Chrome`.
 * @option connection {string}  WebPageTest connection speed, defaults to `Native
 *                              Connection`.
 * @option tests      {string}  Path to the test definitions JSON file, defaults
 *                              to `tests.json`.
 * @option count      {number}  Number of times to run each test, defaults to `9`.
 * @option email      {string}  Email address to send notifications to.
 * @option dump       {string}  Dump intermediate results to file.
 * @option results    {string}  Read intermediate results from file, skips tests.
 * @option mapper     {string}  Mapper to use, defaults to `html-svg`.
 * @option silent     {boolean} Disable logging, overrides `syslog` and `log`.
 * @option syslog     {string}  Send logs to syslog, overrides `log`.
 * @option log        {object}  Logging implementation, needs `log.info()`,
 *                              `log.warn()` and `log.error()`.
 * @option config     {string}  Load options from JSON config file.
 */
function run (options) {
    options = normalise(options);

    if (options.results) {
        return map(options);
    }

    return fetch(options).then(receive.bind(null, options));
}

function receive(options, results) {
    if (options.dump) {
        return dump(options, results).then(map.bind(null, options));
    }

    return map(options, results);
}

function dump (options, results) {
    var log, target, done;

    log = options.log;
    target = path.resolve(options.dump);

    delete results.options.log;

    serialiseTimes(results);

    log.info('dumping intermediates to `' + target + '`');

    fs.writeFile(
        target,
        JSON.stringify(results, null, '    '),
        { encoding: 'utf8', mode: 420 },
        function (error) {
            if (error) {
                log.error('failed to dump intermediates, ' + error.message);
            }

            deserialiseTimes(results);

            done(results);
        }
    );

    return new Promise(function (resolve) { done = resolve; });
}

function serialiseTimes (results) {
    forEachTime(results, function (object, key) {
        object[key] = object[key].toISOString();
    });
}

function forEachTime (results, action) {
    [ 'begin', 'end' ].forEach(action.bind(null, results.times));
}

function deserialiseTimes (results) {
    forEachTime(results, function (object, key) {
        object[key] = new Date(object[key]);
    });
}

/**
 * Public function `fetch`.
 *
 * Invokes WebPageTest, returns an ES6 promise.
 *
 * @option uri        {string}  Base URI for the WebPageTest instance, defaults to
 *                              `www.webpagetest.org`.
 * @option key        {string}  WebPageTest API key.
 * @option location   {string}  WebPageTest location, defaults to `Dulles:Chrome`.
 * @option connection {string}  WebPageTest connection speed, defaults to `Native
 *                              Connection`.
 * @option tests      {string}  Path to the test definitions JSON file, defaults
 *                              to `tests.json`.
 * @option count      {number}  Number of times to run each test, defaults to `9`.
 * @option email      {string}  Email address to send notifications to.
 * @option silent     {boolean} Disable logging, overrides `syslog` and `log`.
 * @option syslog     {string}  Send logs to syslog, overrides `log`.
 * @option log        {object}  Logging implementation, needs `log.info()`,
 *                              `log.warn()` and `log.error()`.
 * @option config     {string}  Load options from JSON config file.
 */
function fetch (options) {
    var time, promise, resolve, reject;

    time = new Date();
    promise = new Promise(function (r1, r2) { resolve = r1; reject = r2; } );

    try {
        options = normalise(options);
        wpt.runTests(options).then(wpt.getResults.bind(null, options)).then(after);
    } catch (error) {
        reject(error);
    }

    return promise;

    function after (results) {
        resolve({
            data: results,
            options: options,
            times: {
                begin: time,
                end: new Date()
            }
        });
    }
}

/**
 * Public function `map`.
 *
 * Maps WebPageTest result data to other formats, returns an ES6 promise.
 *
 * @option uri        {string}  Base URI for the WebPageTest instance, defaults to
 *                              `www.webpagetest.org`.
 * @option key        {string}  WebPageTest API key.
 *                              to `tests.json`.
 * @option results    {string}  Read WebPageTest results from file.
 * @option mapper     {string}  Mapper to use, defaults to `html-svg`.
 * @option silent     {boolean} Disable logging, overrides `syslog` and `log`.
 * @option syslog     {string}  Send logs to syslog, overrides `log`.
 * @option log        {object}  Logging implementation, needs `log.info()`,
 *                              `log.warn()` and `log.error()`.
 * @option config     {string}  Load options from JSON config file.
 */
function map (options, results) {
    var promise, resolve, reject;

    promise = new Promise(function (r1, r2) { resolve = r1; reject = r2; } );

    try {
        options = normalise(options);
        resolve(options.mapper.map(options, options.results || results));
    } catch (error) {
        reject(error);
    }

    return promise;
}

