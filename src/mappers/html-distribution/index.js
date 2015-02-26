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

var check, path, fs, render, packageInfo, views, metrics, names,
    chartWidth, chartHeight, chartMargin, chartPadding, chartFooter,
    axisWidth, xAxisLength, yAxisLength, xAxisOffset, yAxisOffset,
    dataHeight;

check = require('check-types');
path = require('path');
fs = require('fs');
render = require('../../templates').compile(path.join(__dirname, 'template.html'));
packageInfo = require('../../../package.json');

views = [ 'firstView', 'repeatView' ];
metrics = [ 'TTFB', 'render', 'loadTime', 'SpeedIndex' ];
names = {
    firstView: 'First view',
    repeatView: 'Repeat view',
    TTFB: 'First-byte time',
    render: 'Start-render time',
    loadTime: 'Load event time',
    SpeedIndex: 'Speed index'
};

chartWidth = 360;
chartHeight = 180;
chartMargin = 30;
chartPadding = 2;
chartFooter = 20;
axisWidth = 2;
xAxisLength = chartWidth - chartMargin * 2 - axisWidth;
yAxisLength = chartHeight - chartFooter;
xAxisOffset = chartPadding + axisWidth / 2;
yAxisOffset = chartPadding / 2;
dataHeight = yAxisLength - chartPadding - axisWidth;

module.exports = {
    map: map
};

function map (options, results) {
    return render({
        results: results.data.map(mapResult.bind(null, options.log)),
        chartWidth: chartWidth,
        chartHeight: chartHeight,
        chartMargin: chartMargin,
        chartPadding: chartPadding,
        axisWidth: axisWidth,
        xAxisLength: xAxisLength,
        yAxisLength: yAxisLength,
        xAxisOffset: xAxisOffset,
        yAxisOffset: yAxisOffset
    });
}

function mapResult (log, result) {
    var message;

    try {
        message = 'result ' + result.id + ' [' + result.name + ']';
        log.info('mapping ' + message);

        if (result.error) {
            return result;
        }

        return {
            id: result.label,
            name: result.name,
            views: views.map(mapView.bind(null, result))
        };
    } catch (error) {
        log.error('failed to map ' + message + '; ' + error.message);
        return result;
    }
}

function mapView (result, view) {
    return {
        name: names[view],
        metrics: metrics.map(mapMetric.bind(null, result, view))
    };
}

function mapMetric (result, view, metric) {
    var sum, data, ranges, runs, least, greatest, mean, stdev, barWidth, unitsPerPixel;

    sum = 0;
    data = [];
    ranges = [];

    runs = getRuns(result, metric);
    Object.keys(runs).forEach(setData);

    mean = sum / data.length;
    stdev = getStdev(data, mean);

    initialiseRanges(ranges, getRangeCount(least, greatest, mean, stdev));
    data.forEach(addToRanges);

    barWidth = getBarWidth(ranges.length);
    unitsPerPixel = ranges.reduce(getMaxRange, 0) / dataHeight;

    return {
        name: names[metric],
        ranges: ranges.map(mapRange),
        barWidth: barWidth - chartPadding
    };

    function setData (runId) {
        var datum = getDatum(runs[runId], view, metric);

        if (datum === -1) {
            return;
        }

        check.assert.integer(datum);
        check.assert.positive(datum);

        data.push(datum);
        sum += datum;

        if (least === undefined || datum < least) {
            least = datum;
        }

        if (greatest === undefined || datum > greatest) {
            greatest = datum;
        }
    }

    function addToRanges (datum) {
        var rangeIndex = getRangeIndex(datum, mean, stdev, ranges.length);
        ranges[rangeIndex] += 1;
    }

    function mapRange (rangeValue, rangeIndex) {
        var position, lowerBound, upperBound, barHeight, labelOffset, textClass;

        position = rangeIndex - ranges.length / 2;
        lowerBound = Math.floor(position * stdev + mean);
        upperBound = Math.floor((position + 1) * stdev + mean);
        barHeight = rangeValue / unitsPerPixel;
        textClass = 'chart-label';

        if (barHeight > 22) {
            labelOffset = 16;
            textClass += ' chart-bar-label';
        } else {
            labelOffset = 0 - chartPadding;
        }

        return {
            offsetX: rangeIndex * barWidth,
            offsetY: dataHeight - barHeight,
            type: position < 0 ? 'less' : 'greater',
            barHeight: barHeight,
            labelOffset: labelOffset,
            textClass: textClass,
            value: rangeValue,
            lowerBound: lowerBound,
            upperBound: upperBound
        };
    }
}

function getRuns (result, metric) {
    return result[metric].data.runs;
}

function getDatum (run, view, metric) {
    if (!run[view]) {
        return -1;
    }

    return run[view][metric];
}

function getStdev (data, mean) {
    return Math.sqrt(data.reduce(getVariance.bind(null, mean), 0) / data.length);
}

function getVariance (mean, vsum, datum) {
    var difference = datum - mean;
    return vsum + difference * difference;
}

function getRangeCount (least, greatest, mean, stdev) {
    return Math.ceil(greater(mean - least, greatest - mean) / stdev) * 2;
}

function greater (a, b) {
    if (a > b) {
        return a;
    }

    return b;
}

function initialiseRanges (ranges, length) {
    var i;

    for (i = 0; i < length; i += 1) {
        ranges[i] = 0;
    }
}

function getRangeIndex (datum, mean, stdev, rangeCount) {
    return Math.floor((datum - mean) / stdev + rangeCount / 2);
}

function getBarWidth (rangeCount) {
    return xAxisLength / rangeCount;
}

function getMaxRange (max, range) {
    if (max > range) {
        return max;
    }

    return range;
}

