/*globals module, require */

'use strict';

var Prom, medianMetrics;

Prom = require('es6-promise');
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
        var message = 'test ' + index + ' [' + test.name + ']';

        log.info('running ' + message);

        wpt.runTest(test.url, test, after.bind(null, message, test, index));
    });

    return new Promise(function (resolve) { done = resolve; });

    function after (message, test, index, error, result) {
        resultIds[index] = {
            name: test.name,
            type: test.type,
            url: test.url,
            label: test.label,
        };

        if (error) {
            log.error('failed to run ' + message + ', ' + error.message);
            resultIds[index].error = error;
        } else {
            log.info('finished running ' + message);
            resultIds[index].id = result.data.testId;
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
        date.getFullYear() +
            formatNumber(date.getMonth() + 1) +
            formatNumber(date.getDate()),
        formatNumber(date.getHours()) +
            formatNumber(date.getMinutes()) +
            formatNumber(date.getSeconds()),
        formatNumber(index + 1),
        name.toLowerCase().replace(' ', '-')
    ].join('-');
}

function formatNumber (number) {
    if (number < 10) {
        return '0' + number;
    }

    return number;
}

function getResults (options, resultIds) {
    var log, wpt, length, results, count, promise, done;

    log = options.log;
    wpt = initialise(options);
    length = resultIds.length * medianMetrics.length;
    results = new Array(resultIds.length);
    count = 0;
    promise = new Promise(function (resolve) { done = resolve; });

    resultIds.forEach(function (resultId, index) {
        results[index] = resultId;

        medianMetrics.forEach(function (metric) {
            var message;

            message = metric + ' result ' + resultId.id + ' [' + resultId.name + ']';
            log.info('fetching ' + message);

            if (resultId.error) {
                return after(message, index, metric, resultId.error);
            }

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


    return promise;

    function after (message, index, metric, error, result) {
        if (error) {
            log.error('failed to fetch ' + message + ', ' + error.message);
        } else {
            log.info('finished fetching ' + message);
            results[index][metric] = result;
        }

        count += 1;

        if (count === length) {
            done(results);
        }
    }
}

