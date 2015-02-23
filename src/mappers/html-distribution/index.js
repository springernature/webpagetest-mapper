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

var check, path, fs, render, packageInfo, views, metrics,
    chartWidth, chartHeight, chartMargin, yAxisHeight;

path = require('path');
fs = require('fs');
render = require('../../templates').compile(path.join(__dirname, 'template.html'));
packageInfo = require('../../../package.json');

views = [ 'firstView', 'repeatView' ];
metrics = [ 'TTFB', 'render', 'loadTime', 'SpeedIndex' ];

chartWidth = 320;
chartHeight = 400;
chartMargin = 20;
yAxisHeight = 2;

module.exports = {
    map: map
};

function map (options, results) {
    return render({
        results: results.data.map(mapResult.bind(null, options.log))
        chartWidth: chartWidth,
        chartHeight: chartHeight,
        chartMargin: chartMargin,
        yAxisHeight: yAxisHeight
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
        name: view === 'firstView' ? 'First' : 'Repeat',
        metrics: metrics.map(mapMetric.bind(null, result, view))
    };
}

function mapMetric (result, view, metric) {
    // TODO: standard deviation = square root of variance
    // TODO: ranges should be 1 standard deviation
    // TODO: ranges in each direction until there is no data
    // TODO: sum data in each range
    // TODO: calculate bar widths
    // TODO: calculate bar heights
    // TODO: lower and upper bounding values
}

