// Copyright © 2015 Springer Nature
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

var path, check, render, packageInfo,
    charts, chartWidth, chartMargin, chartPadding,
    barHeight, barPadding, labelOffset;

path = require('path');
check = require('check-types');
render = require('../../templates').compile(path.join(__dirname, 'template.html'));
packageInfo = require('../../../package.json');

charts = [
    {
        view: 'first',
        key: 'speedIndex',
        sectionTitle: 'Speed index, first view',
        title: 'Speed index, first view',
        label: 'First-view speed index (lower is better)'
    },
    {
        view: 'first',
        key: 'speedIndex',
        metric: 'rtt',
        title: 'Speed index, first view as RTTs',
        label: 'First-view speed index as a function of RTT'
    },
    {
        view: 'repeat',
        key: 'speedIndex',
        sectionTitle: 'Speed index, repeat view',
        title: 'Speed index, repeat view',
        label: 'Repeat-view speed index (lower is better)'
    },
    {
        view: [ 'repeat', 'first' ],
        key: 'speedIndex',
        derivative: 'percentage',
        title: 'Speed index, repeat-view improvement',
        label: 'Repeat-view speed index as a percentage of first-view'
    },
    {
        view: 'first',
        key: 'firstByte',
        sectionTitle: 'First byte',
        title: 'First byte in milliseconds',
        label: 'Time to first byte (milliseconds)'
    },
    {
        view: 'first',
        key: 'firstByte',
        metric: 'rtt',
        title: 'First byte in RTTs',
        label: 'Time to first byte (RTTs)'
    },
    {
        view: 'first',
        key: [ 'startRender', 'firstByte' ],
        derivative: 'difference',
        sectionTitle: 'Start render, difference from first byte',
        title: 'Start render, difference from first byte in milliseconds',
        label: 'Time from first byte until start render (milliseconds)'
    },
    {
        view: 'first',
        key: [ 'startRender', 'firstByte' ],
        derivative: 'difference',
        metric: 'rtt',
        title: 'Start render, difference from first byte in RTTs',
        label: 'Time from first byte until start render (RTTs)'
    },
    {
        view: 'first',
        key: [ 'load', 'firstByte' ],
        derivative: 'difference',
        sectionTitle: 'Load, difference from first byte',
        title: 'Load, difference from first byte in milliseconds',
        label: 'Time from first byte until load event (milliseconds)'
    },
    {
        view: 'first',
        key: [ 'load', 'firstByte' ],
        derivative: 'difference',
        metric: 'rtt',
        title: 'Load, difference from first byte in RTTs',
        label: 'Time from first byte until load event (RTTs)'
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
    check.assert.object(options, 'invalid options');
    check.assert.unemptyString(options.location, 'invalid location option');
    check.assert.object(results, 'invalid results');
    check.assert.array(results.data, 'invalid result data');
    check.assert.object(results.times, 'invalid result times');
    check.assert.date(results.times.begin, 'invalid begin time');
    check.assert.date(results.times.end, 'invalid end time');

    return render(mapResults(options, results));
}

function mapResults (options, results) {
    var date, formattedDate, locationParts, browser, mapped;

    date = getTime(results, 'end');
    formattedDate = date.toLocaleDateString();

    locationParts = options.location.split(':');
    if (locationParts.length === 1) {
        locationParts = options.location.split('_');
    }

    browser = getBrowser(results) || locationParts[1] || 'unknown';
    mapped = results.data.map(mapResult.bind(null, options.log));

    return {
        application: packageInfo.name,
        version: packageInfo.version,
        date: formattedDate,
        count: options.count,
        location: locationParts[0],
        connection: options.connection,
        browser: browser,
        times: {
            begin: getTime(results, 'begin').toLocaleTimeString(),
            end: date.toLocaleTimeString() + ' on ' + formattedDate
        },
        results: mapped,
        charts: charts.map(mapChart.bind(null, clone(mapped))),
        chartWidth: chartWidth,
        chartMargin: chartMargin,
        barHeight: barHeight,
        labelOffset: labelOffset
    };
}

function getTime (results, key) {
    return results.times[key];
}

function getBrowser (results) {
    /*jshint camelcase:false */

    var data;

    try {
        data = results.data[0].TTFB.data.runs[0].firstView;

        if (check.unemptyString(data.browser_name)) {
            return (data.browser_name + ' ' + data.browser_version).trim();
        }
    } catch (error) {
    }
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
                    value: getMedianRun(result, 'SpeedIndex', 'first').SpeedIndex,
                    rtt: getMedianRun(result, 'SpeedIndex', 'first').server_rtt
                },
                firstByte: {
                    url: getWaterfallUrl(result, 'TTFB', 'first'),
                    value: getMedianRun(result, 'TTFB', 'first').TTFB,
                    rtt: getMedianRun(result, 'TTFB', 'first').server_rtt
                },
                startRender: {
                    url: getWaterfallUrl(result, 'render', 'first'),
                    value: getMedianRun(result, 'render', 'first').render,
                    rtt: getMedianRun(result, 'render', 'first').server_rtt
                },
                load: {
                    url: getWaterfallUrl(result, 'loadTime', 'first'),
                    value: getMedianRun(result, 'loadTime', 'first').loadTime,
                    rtt: getMedianRun(result, 'loadTime', 'first').server_rtt
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
                    value: getMedianRun(result, 'SpeedIndex', 'repeat').SpeedIndex,
                    rtt: getMedianRun(result, 'SpeedIndex', 'repeat').server_rtt
                },
                load: {
                    url: getWaterfallUrl(result, 'loadTime', 'repeat'),
                    value: getMedianRun(result, 'loadTime', 'repeat').loadTime,
                    rtt: getMedianRun(result, 'loadTime', 'repeat').server_rtt
                }
            }
        };
    } catch (error) {
        log.error('failed to map ' + message + '; ' + error.message);
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
    if (score >= 80 || score === -1) {
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

function clone (thing) {
    var cloned;

    if (check.array(thing)) {
        cloned = [];
    } else {
        cloned = {};
    }

    Object.keys(thing).forEach(function (key) {
        var property = thing[key];

        if (check.either.object(property).or.array(property)) {
            cloned[key] = clone(property);
        } else {
            cloned[key] = property;
        }
    });

    return cloned;
}

function mapChart (results, chart) {
    var filteredResults = results.filter(
        filterResults.bind(null, chart.view, chart.key, chart.derivative, chart.metric)
    );

    return {
        title: chart.title,
        sectionTitle: chart.sectionTitle,
        height: filteredResults.length * (barHeight + barPadding) + chartPadding,
        yAxisHeight: filteredResults.length * (barHeight + barPadding) + barPadding,
        tests: filteredResults.sort(
            compareResults.bind(null, chart.view, chart.key, chart.derivative, chart.metric)
        ).map(
            mapChartResult.bind(
                null,
                chart.view,
                chart.key,
                chart.derivative,
                chart.metric,
                getMaximumValue(
                    chart.view, chart.key, chart.derivative, chart.metric, results
                ) / (chartWidth - chartMargin)
            )
        ),
        label: chart.label,
        xAxis: {
            offset: filteredResults.length * (barHeight + barPadding) + 1,
            width: chartWidth - chartMargin + 2,
            labelPosition: Math.round((chartWidth - chartMargin + 2) / 2)
        }
    };
}

barPadding = 2;
chartPadding = 29;

function filterResults (view, chartKey, derivative, metric, result) {
    return getValue(view, chartKey, derivative, metric, result) >= 0;
}

function getValue (view, chartKey, derivative, metric, result) {
    if (derivative) {
        return getDerivativeValue(view, chartKey, derivative, metric, result);
    }

    return getSimpleValue(view, chartKey, metric, result);

}

function getDerivativeValue (view, chartKey, derivative, metric, result) {
    var operands = getDerivativeOperands(view, chartKey, metric, result);

    if (derivative === 'difference') {
        return operands.lhs - operands.rhs;
    }

    if (derivative === 'percentage') {
        return Math.round((operands.lhs / operands.rhs) * 100);
    }

    throw new Error('unrecognised derivative `' + derivative + '`');
}

function getDerivativeOperands (view, chartKey, metric, result) {
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

    if (metric === 'rtt') {
        return {
            lhs: expressValueInRtt(lhs),
            rhs: expressValueInRtt(rhs)
        };
    }

    return { lhs: lhs.value, rhs: rhs.value };
}

function getViewResult (view, result) {
    return result[view + 'View'];
}

function expressValueInRtt (datum) {
    if (!datum.rtt) {
        return -1;
    }

    return Math.ceil(datum.value / datum.rtt);
}

function getSimpleValue (view, chartKey, metric, result) {
    var datum = getViewResult(view, result)[chartKey];

    if (metric === 'rtt') {
        return expressValueInRtt(datum);
    }

    return datum.value;
}

function compareResults (view, chartKey, derivative, metric, first, second) {
    if (first.error) {
        return 1;
    }

    if (second.error) {
        return -1;
    }

    return getValue(view, chartKey, derivative, metric, first) -
        getValue(view, chartKey, derivative, metric, second);
}

function getMaximumValue (view, chartKey, derivative, metric, results) {
    return results.reduce(function (maximum, result) {
        var current;

        if (result.error) {
            return maximum;
        }

        current = getValue(view, chartKey, derivative, metric, result);

        if (current > maximum) {
            return current;
        }

        return maximum;
    }, 0);
}

function mapChartResult (view, chartKey, derivative, metric, unitsPerPixel, result, index) {
    var value, barWidth, textOrientation, textClass, textAnchor;

    if (result.error) {
        return result;
    }

    value = getValue(view, chartKey, derivative, metric, result);
    barWidth = value / unitsPerPixel;

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

