/*globals module, require, process */

'use strict';

var medianMetrics;

module.exports = {
    runTests: runTests,
    getResults: getResults
};

/**
 *
 * @option uri
 * @option key
 * @option location
 * @option connection
 * @option tests
 * @option count
 * @option email
 * @option output
 * @option dump
 * @option results
 * @option log
 */
function runTests (options, callback) {
    var log, wpt, count, results, date;

    log = options.log;
    wpt = initialise(options);
    count = 0;
    results = new Array(tests.length);
    date = new Date();

    marshallTests(options, date).forEach(function (test, index) {
        log.info('Testing ' + test.label);

        wpt.runTest(test.url, test, function (error, result) {
            if (error) {
                log.error('Test ' + test.label + 'failed, ' + error.message);
            } else {
                log.info('Completed test ' + test.label + ', result id is ' + getResultId(result));
                results[index] = result;
            }

            count += 1;

            if (count === tests.length) {
                callback(marshallResultIds(results));
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
        url: test.url,
        name: test.name,
        type: test.type,
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

function getResultId (result) {
    return result.response.data.testId;
}

function marshallResultIds (results) {
    return results.map(function (result, index) {
        return {
            name: tests[index].name,
            type: tests[index].type,
            id: getResultId(result)
        };
    });
}

function getResults (options, testIds, callback) {
    var length, results, count;

    length = testIds.length * medianMetrics.length;
    results = new Array(testIds.length);
    count = 0;

    testIds.forEach(function (testId, index) {
        results[index] = {
            name: testId.name,
            type: testId.type
        };

        medianMetrics.forEach(function (metric) {
            log.info('Getting ' + metric + ' results for ' + testId.name);

            wpt.getTestResults(testId.id, {
                key: options.key,
                breakDown: true,
                domains: true,
                pageSpeed: false,
                requests: false,
                medianMetric: metric
            }, function (error, result) {
                if (error) {
                    log.error('Failed to get ' + metric + ' results for ' + testId.name + ': ' + error.message);
                } else {
                    log.info('Got ' + metric + ' results for ' + testId.name);
                    results[index][metric] = result;
                }

                count += 1;

                if (count === length) {
                    callback(results);
                }
            });
        });
    });
}

medianMetrics = [ 'SpeedIndex', 'TTFB', 'render', 'loadTime' ];

