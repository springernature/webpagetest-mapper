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

/*globals require, module, Promise */

'use strict';

var bfj, path, normalise, get, wpt;

bfj = require('bfj');
path = require('path');
normalise = require('./options').normalise;
get = require('./options').get;
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
 * @option mapper     {string}  Mapper to use, defaults to `html-comparison`.
 * @option silent     {boolean} Disable logging, overrides `syslog` and `log`.
 * @option syslog     {string}  Send logs to syslog, overrides `log`.
 * @option log        {object}  Logging implementation, needs `log.info()`,
 *                              `log.warn()` and `log.error()`.
 * @option config     {string}  Load options from JSON config file.
 */
function run (options) {
    if (options.results) {
        return map(options);
    }

    return fetch(options).then(map.bind(null, options));
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
 * @option dump       {string}  Dump intermediate results to file.
 * @option resultIds  {array}   Bypass running the tests and fetch the specified
 *                              results instead.
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

        if (options.resultIds) {
            wpt.getResults(options, options.resultIds).then(after);
        } else {
            wpt.runTests(options).then(wpt.getResults.bind(null, options)).then(after);
        }
    } catch (error) {
        reject(error);
    }

    return promise;

    function after (results) {
        results = {
            data: results,
            options: options,
            times: {
                begin: time,
                end: new Date()
            }
        };

        if (options.dump) {
            dump(options, results);
        }

        resolve(results);
    }
}

function dump (options, results) {
    var log, target;

    log = options.log;
    target = path.resolve(options.dump);

    log.info('dumping intermediates to `' + target + '`');

    bfj.write(target, results, { encoding: 'utf8', mode: 420 }).
        catch(function (error) {
            log.error('failed to dump intermediates, ' + error.message);
        });
}

/**
 * Public function `map`.
 *
 * Maps WebPageTest result data to other formats, returns an ES6 promise.
 *
 * @option results    {string}  Read WebPageTest results from file.
 * @option mapper     {string}  Mapper to use, defaults to `html-comparison`.
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
        // Song and dance to ensure that map options match fetch options.
        results = results || get.results(options);
        results.options.log = get.log(options);
        results.options.mapper = get.mapper(options);
        options = results.options;

        resolve(options.mapper.map(options, results));
    } catch (error) {
        reject(error);
    }

    return promise;
}

