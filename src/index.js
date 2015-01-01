/*globals require, module */

'use strict';

var options, wpt;

options = require('./options');
wpt = require('./webpagetest');

module.exports = {
    run: run,
    fetch: fetch,
    map: map
};

/**
 * Public function `run`.
 *
 * Invokes WebPageTest then maps the result data.
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
function run (options, callback) {
    if (options.results) {
        return map(options, callback);
    }

    // TODO: convert to promises
    fetch(options, map.bind(null, options));
}

/**
 * Public function `fetch`.
 *
 * Invokes WebPageTest.
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
function fetch (options, callback) {
    var time;

    options.normalise(options);

    time = new Date();

    // TODO: promises
    wpt.runTests(options, function (resultIds) {
        wpt.getResults(options, resultIds, function (results) {
            results.times = {
                begin: begin,
                end: new Date()
            };

            callback(results);
        });
    });
}

/**
 * Public function `map`.
 *
 * Maps WebPageTest result data to other formats.
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
function map (options) {
    options.normalise(options);
}

