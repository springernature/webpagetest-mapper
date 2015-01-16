// Copyright © 2015 Nature Publishing Group
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

/*globals module, require, setTimeout */

'use strict';

var medianMetrics, redundantProperties;

medianMetrics = [ 'SpeedIndex', 'TTFB', 'render', 'loadTime' ];
redundantProperties = {
    metric: [ 'statusCode', 'statusText' ],
    data: [ 'url', 'testUrl', 'from', 'tester', 'testerDNS' ],
    run: [
        'URL', 'result', 'cached', 'title', 'run', 'tester',
        'thumbnails', 'images', 'rawData', 'videoFrames',
        'domains', 'breakdown'
    ]
};

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
            log.error('failed to run ' + message + '; ' + (error.message || error.statusText));
            resultIds[index].error = error;
        } else {
            log.info('finished running ' + message);
            resultIds[index].id = result.data.id;
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

    return '' + number;
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

        if (resultId.error) {
            length -= medianMetrics.length;
        } else {
            medianMetrics.forEach(getResult.bind(null, resultId, index));
        }
    });

    return promise;

    function getResult (resultId, index, metric) {
        var message;

        message = metric + ' result ' + resultId.id + ' [' + resultId.name + ']';
        log.info('fetching ' + message);

        wpt.getTestResults(resultId.id, {
            key: options.key,
            breakDown: false,
            domains: false,
            pageSpeed: false,
            requests: false,
            medianMetric: metric
        }, after.bind(null, message, resultId, index, metric));
    }

    function after (message, resultId, index, metric, error, result) {
        if (result.statusCode < 200) {
            log.info('still waiting for ' + message);
            return setTimeout(getResult.bind(null, resultId, index, metric), 60000);
        }

        if (error) {
            log.error('failed to fetch ' + message + '; ' + (error.message || error.statusText));
        } else {
            log.info('finished fetching ' + message);
            results[index][metric] = result;
        }

        count += 1;

        if (count === length) {
            results.forEach(shrink);
            done(results);
        }
    }
}

function shrink (result) {
    medianMetrics.forEach(function (key) {
        var metric = result[key];

        if (metric) {
            shrinkMetric(metric);
            shrinkData(metric.data);
            shrinkRuns(metric.data.runs);
        }
    });
}

function shrinkMetric (metric) {
    deleteProperties('metric', metric);
}

function deleteProperties (properties, object) {
    redundantProperties[properties].forEach(function (property) {
        try {
            delete object[property];
            console.log('deleteProperties success: ' + properties);
        } catch (error) {
            console.log('deleteProperties error: ' + properties);
            console.log(error.stack);
        }
    });
}

function shrinkData (data) {
    deleteProperties('data', data);
}

function shrinkRuns (runs) {
    Object.keys(runs).forEach(function (key) {
        deleteProperties('run', runs[key].firstView);
        deleteProperties('run', runs[key].repeatView);
    });
}

