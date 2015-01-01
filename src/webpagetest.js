/*globals module, require */

'use strict';

var medianMetrics;

module.exports = {
    runTests: runTests,
    getResults: getResults
};

function runTests (options, callback) {
    var log, wpt, count, results, date;

    log = options.log;
    wpt = initialise(options);
    count = 0;
    results = new Array(options.tests.length);
    date = new Date();

    marshallTests(options, date).forEach(function (test, index) {
        log.info('testing ' + test.label);

        wpt.runTest(test.url, test, function (error, result) {
            if (error) {
                log.error('failed to test ' + test.label + ', ' + error.message);
            } else {
                results[index] = {
                    name: test.name,
                    type: test.type,
                    label: test.label,
                    id: result.response.data.testId
                };
            }

            count += 1;

            if (count === options.tests.length) {
                callback(results);
            }
        });
    });
}

function initialise (options) {
    return new (require('webpagetest'))(options.uri);
}

function marshallTests (options, date) {
    return options.tests.map(marshallTest.bind(null, options, date));
}

function marshallTest (options, date, test, index) {
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
        index,
        name.toLowerCase().replace(' ', '-')
    ].join('-');
}

function getResults (options, resultIds, callback) {
    var log, wpt, length, results, count;

    log = options.log;
    wpt = initialise(options);
    length = resultIds.length * medianMetrics.length;
    results = new Array(resultIds.length);
    count = 0;

    resultIds.forEach(function (resultId, index) {
        results[index] = resultId;

        medianMetrics.forEach(function (metric) {
            log.info('fetching ' + metric + ' results for ' + resultId.label);

            wpt.getTestResults(resultId.id, {
                key: options.key,
                breakDown: true,
                domains: true,
                pageSpeed: false,
                requests: false,
                medianMetric: metric
            }, function (error, result) {
                if (error) {
                    log.error('failed ' + metric + ' fetch for ' + resultId.label + ': ' + error.message);
                } else {
                    log.info('completed ' + metric + ' fetch for ' + resultId.label);

                    results[index][metric] = result;
                }

                count += 1;

                if (count === length) {
                    callback(options, results);
                }
            });
        });
    });
}

medianMetrics = [ 'SpeedIndex', 'TTFB', 'render', 'loadTime' ];

