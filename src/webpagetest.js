/*globals module, require */

'use strict';

var Prom, results, medianMetrics;

Prom = require('es6-promise');
results = require('./results');
medianMetrics = [ 'SpeedIndex', 'TTFB', 'render', 'loadTime' ];

module.exports = {
    runTests: runTests,
    getResults: getResults
};

function runTests (options) {
    var log, wpt, resultIds, count, done;

    log = options.log;
    wpt = initialise(options);
    resultIds = new Array(options.tests.length);
    count = 0;

    mapTests(options, new Date()).forEach(function (test, index) {
        var message = 'test ' + index + '[' + test.name + ']';

        log.info('running ' + message);

        wpt.runTest(test.url, test, after.bind(null, message, test, index));
    });

    return new Prom(function (resolve) { done = resolve; });

    function after (message, test, index, error, result) {
        if (error) {
            log.error('failed to run ' + message + ', ' + error.message);
        } else {
            log.info('finished running ' + message);
            resultIds[index] = {
                name: test.name,
                type: test.type,
                url: test.url,
                label: test.label,
                id: result.response.data.testId
            };
        }

        count += 1;

        if (count === options.tests.length) {
            done(resultIds);
        }
    }
}

function initialise (options) {
    return new (require('webpagetest'))(options.uri);
}

function mapTests (options, date) {
    return options.tests.map(mapTest.bind(null, options, date));
}

function mapTest (options, date, test, index) {
    return {
        name: test.name,
        type: test.type,
        url: test.url,
        key: options.key,
        location: options.location,
        runs: options.count,
        firstViewOnly: false,
        label: getTestLabel(date, test.name, index),
        private: false,
        video: true,
        connectivity: options.connection,
        stopAtDocumentComplete: false,
        notifyEmail: options.email,
        tcpDump: false,
        disableOptimization: false,
        disableScreenshot: false,
        disableHTTPHeaders: false,
        fullResolutionScreenshot: false,
        jpegQuality: 85,
        disableJavaScript: false,
        ignoreSSL: false,
        saveResponseBodies: true,
        keepOriginalUserAgent: false,
        blockAds: false,
        aftRenderingTime: true,
        htmlBody: false,
        continuous: false,
        clearCerts: false,
        medianVideo: true,
        emulateMobile: false,
        timeline: false,
        netLog: false,
        forceSpdy3: false,
        forceSoftwareRendering: false,
        disableThreadedParser: false,
        spdyNoSSL: false,
        pollResults: 30
    };
}

function getTestLabel (date, name, index) {
    return [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        index,
        name.toLowerCase().replace(' ', '-')
    ].join('-');
}

function getResults (options, resultIds) {
    var log, wpt, length, unnormalised, count, done;

    log = options.log;
    wpt = initialise(options);
    length = resultIds.length * medianMetrics.length;
    unnormalised = new Array(resultIds.length);
    count = 0;

    resultIds.forEach(function (resultId, index) {
        unnormalised[index] = resultId;

        medianMetrics.forEach(function (metric) {
            var message;

            message = metric + ' result ' + resultId.id + '[' + resultId.name + ']';
            log.info('fetching ' + message);

            wpt.getTestResults(resultId.id, {
                key: options.key,
                breakDown: true,
                domains: true,
                pageSpeed: false,
                requests: false,
                medianMetric: metric
            }, after.bind(null, message, index, metric));
        });
    });

    return new Prom(function (resolve) { done = resolve; });

    function after (message, index, metric, error, result) {
        if (error) {
            log.error('failed to fetch ' + message + ', ' + error.message);
        } else {
            log.info('finished fetching ' + message);
            unnormalised[index][metric] = result;
        }

        count += 1;

        if (count === length) {
            done(results.normalise(options, unnormalised));
        }
    }
}

