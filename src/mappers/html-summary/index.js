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

/*jshint nomen:false */
/*globals require, __dirname, module */

'use strict';

var path, fs, handlebars, render, packageInfo,
    charts, chartWidth, chartMargin, chartPadding,
    barHeight, barPadding, labelOffset;

path = require('path');
fs = require('fs');
render = require('../../templates').compile(path.join(__dirname, 'template.html'));
packageInfo = require('../../../package.json');

charts = [
    {
        view: 'first',
        key: 'speedIndex',
        title: 'Speed index, first view',
        label: 'First-view speed index (lower is better)'
    },
    {
        view: 'repeat',
        key: 'speedIndex',
        title: 'Speed index, repeat view',
        label: 'Repeat-view speed index (lower is better)'
    },
    {
        view: [ 'repeat', 'first' ],
        key: 'speedIndex',
        derivative: 'percentage',
        title: 'Speed index, repeat-view improvement',
        label: 'Repeat-view speed index as a percentage of first-view (lower is better)'
    },
    {
        view: 'first',
        key: 'firstByte',
        title: 'First byte',
        label: 'Time to first byte (milliseconds)'
    },
    {
        view: 'first',
        key: [ 'startRender', 'firstByte' ],
        derivative: 'difference',
        title: 'Start render, difference from first byte',
        label: 'Time from first byte until start render (milliseconds)'
    },
    {
        view: 'first',
        key: [ 'load', 'firstByte' ],
        derivative: 'difference',
        title: 'Load, difference from first byte',
        label: 'Time from first byte until load event (milliseconds)'
    }
];

chartWidth = 832;
chartMargin = 140;
chartPadding = 29;
barHeight = 32;
barPadding = 2;
labelOffset = 16;

module.exports = {
    map: map
};

function map (options, results) {
    return render(mapResults(options, results));
}

function mapResults (options, results) {
    var date, formattedDate, locationParts, mapped;

    date = getTime(results, 'end');
    formattedDate = date.toLocaleDateString();
    mapped = results.data.map(mapResult.bind(null, options.log));

    // HACK: This should be replaced by data from webpagetest.getLocations()
    locationParts = options.location.split(':');
    if (locationParts.length === 1) {
        locationParts = options.location.split('_');
    }

    return {
        application: packageInfo.name,
        version: packageInfo.version,
        date: formattedDate,
        count: options.count,
        location: locationParts[0],
        connection: options.connection,
        browser: locationParts[1] || 'unknown',
        times: {
            begin: getTime(results, 'begin').toLocaleTimeString(),
            end: date.toLocaleTimeString() + ' on ' + formattedDate
        },
        results: mapped,
        charts: charts.map(mapChart.bind(null, mapped)),
        chartWidth: chartWidth,
        chartMargin: chartMargin,
        barHeight: barHeight,
        labelOffset: labelOffset,
        xAxis: {
            offset: mapped.length * (barHeight + barPadding) + 1,
            width: chartWidth - chartMargin + 2,
            labelPosition: Math.round((chartWidth - chartMargin + 2) / 2)
        }
    };
}

function getTime (results, key) {
    return results.times[key];
}

function mapResult (log, result) {
    /*jshint camelcase:false */

    var message;

    try {
        message = 'result ' + result.id + ' [' + result.name + ']';
        log.info('mapping ' + message);

        if (result.error) {
            return result;
        }

        return {
            name: result.name,
            type: result.type,
            url: result.url,
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
                    value: getMedianRun(result, 'SpeedIndex', 'first').requests.length
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
    return getUrls(result, medianMetric, view).checklist;
}

function getUrls (result, medianMetric, view) {
    var median, run;

    median = getMedianRun(result, medianMetric, view);

    if (Array.isArray(median.run)) {
        // TODO: I don't *think* this condition is entered any more...
        run = median.run[0];
    } else {
        run = median.run;
    }

    return getData(result, medianMetric).runs[run][getViewKey(view)].pages;
}

function getMedianRun (result, metric, view) {
    return getData(result, metric).median[getViewKey(view)];
}

function getViewKey (view) {
    return view + 'View';
}

function getData (result, metric) {
    return result[metric].data;
}

function getWaterfallUrl (result, medianMetric, view) {
    return getUrls(result, medianMetric, view).details;
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

function mapChart (results, chart) {
    return {
        title: chart.title,
        height: results.length * (barHeight + barPadding) + chartPadding,
        yAxisHeight: results.length * (barHeight + barPadding) + barPadding,
        tests: results.sort(
            compareResults.bind(null, chart.view, chart.key, chart.derivative)
        ).map(
            mapChartResult.bind(
                null,
                chart.view,
                chart.key,
                chart.derivative,
                getMaximumValue(chart.view, chart.key, chart.derivative, results) / (chartWidth - chartMargin)
            )
        ),
        label: chart.label
    };
}

barPadding = 2;
chartPadding = 29;

function compareResults (view, chartKey, derivative, first, second) {
    if (first.error) {
        return 1;
    }

    if (second.error) {
        return -1;
    }

    return getValue(view, chartKey, derivative, first) - getValue(view, chartKey, derivative, second);
}

function getValue (view, chartKey, derivative, result) {
    if (derivative) {
        return getDerivativeValue(view, chartKey, result, derivative);
    }

    return getSimpleValue(view, chartKey, result);
}

function getDerivativeValue (view, chartKey, result, derivative) {
    var operands = getDerivativeOperands(view, chartKey, result);

    if (derivative === 'difference') {
        return operands.lhs.value - operands.rhs.value;
    }

    if (derivative === 'percentage') {
        return Math.round((operands.lhs.value / operands.rhs.value) * 100);
    }

    throw new Error('unrecognised derivative `' + derivative + '`');
}

function getDerivativeOperands (view, chartKey, result) {
    var lhs, rhs;

    if (Array.isArray(view)) {
        lhs = getViewResult(view[0], result);
        rhs = getViewResult(view[1], result);
    } else {
        lhs = rhs = getViewResult(view, result);
    }

    if (Array.isArray(chartKey)) {
        lhs = lhs[chartKey[0]];
        rhs = rhs[chartKey[1]];
    } else {
        lhs = lhs[chartKey];
        rhs = rhs[chartKey];
    }

    return { lhs: lhs, rhs: rhs };
}

function getViewResult (view, result) {
    return result[view + 'View'];
}

function getSimpleValue (view, chartKey, result) {
    return getViewResult(view, result)[chartKey].value;
}

function getMaximumValue (view, chartKey, derivative, results) {
    return results.reduce(function (maximum, result) {
        var current;

        if (result.error) {
            return maximum;
        }

        current = getValue(view, chartKey, derivative, result);

        if (current > maximum) {
            return current;
        }

        return maximum;
    }, 0);
}

function mapChartResult (view, chartKey, derivative, millisecondsPerPixel, result, index) {
    var value, barWidth, textOrientation, textClass, textAnchor;

    if (result.error) {
        return result;
    }

    value = getValue(view, chartKey, derivative, result);
    barWidth = value / millisecondsPerPixel;

    if (barWidth % 1 !== 0) {
        barWidth = barWidth.toFixed(2);
    }

    textOrientation = '';
    textClass = 'chart-label';

    if (barWidth < 40) {
        textAnchor = 'start';
    } else {
        textOrientation = '-';
        textClass += ' chart-bar-label';
        textAnchor = 'end';
    }

    return {
        offset: index * (barHeight + barPadding),
        name: result.name,
        type: result.type,
        barWidth: barWidth,
        value: value + (derivative === 'percentage' ? '%' : ''),
        textOrientation: textOrientation,
        textClass: textClass,
        textAnchor: textAnchor
    };
}

