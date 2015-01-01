/*globals module */

'use strict';

module.exports = {
    normalise: normalise
};

function normalise (options, results) {
    return results.map(mapResult.bind(null, options.log));
}

function mapResult (log, result) {
    /*jshint camelcase:false */

    var message;

    try {
        message = 'result ' + result.id + '[' + result.name + ']';
        log.info('mapping ' + message);

        return {
            name: result.name,
            type: result.type,
            url: result.url,
            label: result.label,
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
    } catch (error) {
        log.error('failed to map ' + message + ', ' + error.message);
        return result;
    }
}

function getOptimisationsUrl (result, medianMetric, view) {
    return getBaseUri(result, medianMetric, view) + 'performance_optimization/';
}

function getBaseUri (result, medianMetric, view) {
    var median = getMedianRun(result, medianMetric, view);

    if (!median || !Array.isArray(median.run) || median.run.length !== 2 || median.run[0] !== median.run[1]) {
        throw new Error(
            'weird data in getBaseUri: ' +
                !!median + ', ' +
                Array.isArray(median.run) + ', ' +
                median.run.length + ', ' +
                median.run[0] + ', ' +
                median.run[1]
        );
    }

    return getData(result, medianMetric).summary + median.run[0] + '/';
}

function getWaterfallUrl (result, medianMetric, view) {
    return getBaseUri(result, medianMetric, view) + 'details/';
}

function getData (result, metric) {
    return result[metric].response.data;
}

function getMedianRun (result, metric, view) {
    return getData(result, metric).median[view + 'View'];
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

