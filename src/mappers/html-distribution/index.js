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

var check, path, render, packageInfo, views, metrics, names,
    chartWidth, chartHeight, chartMargin, chartPadding, chartFooter,
    axisWidth, xAxisLength, yAxisLength, xAxisOffset, yAxisOffset,
    dataHeight;

check = require('check-types');
path = require('path');
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
        application: packageInfo.name,
        version: packageInfo.version,
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
    var sum, data, ranges, runs, least, greatest, mean, stdev,
        filterableRangeIndices, barWidth, unitsPerPixel;

    sum = 0;
    data = [];
    ranges = [];

    runs = getRuns(result, metric);
    Object.keys(runs).forEach(setData);

    mean = sum / data.length;
    stdev = getStdev(data, mean);

    initialiseRanges(ranges, getRangeCount(least, greatest, mean, stdev));
    data.forEach(addToRanges);
    filterableRangeIndices = getFilterableRangeIndices(ranges);

    barWidth = getBarWidth(ranges.length - filterableRangeIndices.length);
    unitsPerPixel = ranges.reduce(greater, 0) / dataHeight;

    return {
        name: names[metric],
        ranges: ranges.map(mapRange).filter(filterRange),
        barWidth: barWidth - chartPadding
    };

    function setData (runId) {
        var datum = getDatum(runs[runId], view, metric);

        if (datum === -1) {
            return;
        }

        check.assert.integer(datum);
        check.assert.not.negative(datum);

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
        var position, lowerBound, upperBound, barHeight, labelOffset, textClass, indexShift;

        position = rangeIndex - ranges.length / 2;
        lowerBound = Math.floor(position * stdev + mean);
        upperBound = Math.floor((position + 1) * stdev + mean);
        barHeight = rangeValue / unitsPerPixel;
        textClass = 'chart-label';
        indexShift = filterableRangeIndices.reduce(getRangeIndexShift.bind(null, rangeIndex), 0);

        if (barHeight > 22) {
            labelOffset = 16;
            textClass += ' chart-bar-label';
        } else {
            labelOffset = 0 - chartPadding;
        }

        return {
            offsetX: (rangeIndex - indexShift) * barWidth,
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

    function filterRange (range, rangeIndex) {
        return filterableRangeIndices.indexOf(rangeIndex) === -1;
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
    if (stdev === 0) {
        return 2;
    }

    return Math.ceil((greater(mean - least, greatest - mean) + 1) / stdev) * 2;
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
    if (stdev === 0) {
        return 1;
    }

    return Math.floor((datum - mean) / stdev + rangeCount / 2);
}

function getFilterableRangeIndices (ranges) {
    var indices, i;

    indices = [];

    for (i = 0; i < ranges.length; i += 1) {
        if (ranges[i] === 0) {
            indices.push(i);
        } else {
            break;
        }
    }

    for (i = ranges.length - 1; i >= 0; i -= 1) {
        if (ranges[i] === 0) {
            indices.push(i);
        } else {
            break;
        }
    }

    return indices;
}

function getBarWidth (rangeCount) {
    return xAxisLength / rangeCount;
}

function getRangeIndexShift (rangeIndex, shiftCount, filterableRangeIndex) {
    if (filterableRangeIndex < rangeIndex) {
        shiftCount += 1;
    }

    return shiftCount;
}

