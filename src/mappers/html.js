/*globals module, require, process */

'use strict';

var medianMetrics;

module.exports = {
    runTests: runTests,
    getResults: getResults
};

/*
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
                    callback(marshallResults(results));
                }
            });
        });
    });
}

medianMetrics = [ 'SpeedIndex', 'TTFB', 'render', 'loadTime' ];

function marshallResults (results) {
    try {
        return results.map(marshallResult);
    } catch (error) {
        log.error(error.stack);
        process.exit(1);
    }
}

function marshallResult (result) {
    /*jshint camelcase:false */
    return {
        name: result.name,
        type: result.type,
        url: result.SpeedIndex.response.data.testUrl,
        optimisationsUrl: getOptimisationsUrl(result, 'SpeedIndex', 'first'),
        firstView: {
            speedIndex: {
                url: getWaterfallUrl(result, 'SpeedIndex', 'first'),
                value: getMedianRun(result, 'SpeedIndex', 'first').SpeedIndex
            },
            firstByte: {
                url: getWaterfallUrl(result, 'TTFB', 'first'),
                value: getMedianRun(result, 'TTFB', 'first').TTFB
            },
            startRender: {
                url: getWaterfallUrl(result, 'render', 'first'),
                value: getMedianRun(result, 'render', 'first').render
            },
            load: {
                url: getWaterfallUrl(result, 'loadTime', 'first'),
                value: getMedianRun(result, 'loadTime', 'first').loadTime
            },
            bytes: {
                url: getWaterfallUrl(result, 'SpeedIndex', 'first'),
                value: getMedianRun(result, 'SpeedIndex', 'first').bytesIn
            },
            requests: {
                url: getWaterfallUrl(result, 'SpeedIndex', 'first'),
                value: getMedianRun(result, 'SpeedIndex', 'first').requests
            },
            connections: {
                url: getWaterfallUrl(result, 'SpeedIndex', 'first'),
                value: getMedianRun(result, 'SpeedIndex', 'first').connections
            },
            targetFirstByte: {
                rating: getRating(getFirstByteScore(getMedianRun(result, 'SpeedIndex', 'first'))),
                value: getFirstByteScore(getMedianRun(result, 'SpeedIndex', 'first'))
            },
            persistent: {
                rating: getRating(getMedianRun(result, 'SpeedIndex', 'first')['score_keep-alive']),
                value: getMedianRun(result, 'SpeedIndex', 'first')['score_keep-alive']
            },
            gzip: {
                rating: getRating(getMedianRun(result, 'SpeedIndex', 'first').score_gzip),
                value: getMedianRun(result, 'SpeedIndex', 'first').score_gzip
            },
            images: {
                rating: getRating(getMedianRun(result, 'SpeedIndex', 'first').score_compress),
                value: getMedianRun(result, 'SpeedIndex', 'first').score_compress
            },
            progJpeg: {
                rating: getRating(getMedianRun(result, 'SpeedIndex', 'first').score_progressive_jpeg),
                value: getMedianRun(result, 'SpeedIndex', 'first').score_progressive_jpeg
            },
            caching: {
                rating: getRating(getMedianRun(result, 'SpeedIndex', 'first').score_cache),
                value: getMedianRun(result, 'SpeedIndex', 'first').score_cache
            },
            cdn: {
                rating: getRating(getMedianRun(result, 'SpeedIndex', 'first').score_cdn),
                value: getMedianRun(result, 'SpeedIndex', 'first').score_cdn
            }
        },
        repeatView: {
            speedIndex: {
                url: getWaterfallUrl(result, 'SpeedIndex', 'repeat'),
                value: getMedianRun(result, 'SpeedIndex', 'repeat').SpeedIndex
            },
            load: {
                url: getWaterfallUrl(result, 'loadTime', 'repeat'),
                value: getMedianRun(result, 'loadTime', 'repeat').loadTime
            }
        }
    };
}

function getOptimisationsUrl (result, medianMetric, view) {
    return getBaseUri(result, medianMetric, view) + 'performance_optimization/';
}

function getBaseUri (result, medianMetric, view) {
    var median = getMedianRun(result, medianMetric, view);

    if (!median || !Array.isArray(median.run) || median.run.length !== 2 || median.run[0] !== median.run[1]) {
        log.error('Fatal error: Weird data in getBaseUri');
        process.exit(1);
    }

    return getMedianData(result, medianMetric).summary + median.run[0] + '/';
}

function getWaterfallUri (result, medianMetric, view) {
    return getBaseUri(result, medianMetric, view) + 'details/';
}

function getMedianData (result, medianMetric) {
    return result[medianMetric].response.data;
}

function getMedianRun (result, medianMetric, view) {
    return getMedianData(result, medianMetric).median[view + 'View'];
}

function getRating (score) {
    if (score >= 80) {
        return 'good';
    }

    if (score >= 50) {
        return 'okay';
    }

    return 'bad';
}

function getFirstByteScore (data) {
    /*jshint camelcase:false */
    var actual, target, difference;

    if (!data.server_rtt) {
        return 0;
    }

    actual = data.TTFB;
    target = data.server_rtt * 3;
    difference = actual - target;

    if (difference <= 0) {
        return 100;
    }

    if (difference >= 1000) {
        return 0;
    }

    return 100 - Math.round(difference / 10);
}

