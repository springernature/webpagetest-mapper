/*globals require, module, Promise */

'use strict';

var normalise, wpt;

require('es6-promise').polyfill();
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
 * @option mapper     {string}  Mapper to use.
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

    console.log(promise);

    try {
        normalise(options);
        wpt.runTests(options).then(wpt.getResults.bind(null, options)).then(after);
    } catch (error) {
        reject(error);
    }

    return promise;

    function after (results) {
        results.times = {
            begin: time,
            end: new Date()
        };
        results.options = options;

        resolve(results);
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
 * @option results    {string}  WebPageTest results.
 * @option mapper     {string}  Mapper to use.
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
        normalise(options);
        resolve(options.mapper.map(options, results || options.results));
    } catch (error) {
        reject(error);
    }

    return promise;
}

