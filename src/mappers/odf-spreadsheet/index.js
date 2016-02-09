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

var fs, path, JSZip, packageInfo, templates,
    render, views, metrics, metricsLength;

fs = require('fs');
path = require('path');
JSZip = require('jszip');
packageInfo = require('../../../package.json');
templates = require('../../templates');

render = {
    meta: templates.compile(path.join(__dirname, 'meta.xml')),
    content: templates.compile(path.join(__dirname, 'content.xml'))
};

views = [ 'firstView', 'repeatView' ];
metrics = [ 'TTFB', 'render', 'loadTime', 'SpeedIndex' ];
metricsLength = views.length * metrics.length;

module.exports = {
    map: map
};

function map (options, results) {
    var zip = new JSZip();

    zip.file('META-INF/manifest.xml', readFile('manifest.xml'));
    zip.file('mimetype', 'application/vnd.oasis.opendocument.spreadsheet');
    zip.file('meta.xml', render.meta(mapMeta(results)));
    zip.file('styles.xml', readFile('styles.xml'));
    zip.file('content.xml', render.content(mapContent(options, results)));

    return zip.generate({ compression: 'DEFLATE', type: 'nodebuffer' });
}

function readFile (name) {
    return fs.readFileSync(path.join(__dirname, name), { encoding: 'utf8' });
}

function mapMeta (results) {
    return {
        application: packageInfo.name,
        version: packageInfo.version,
        date: results.times.end.toLocaleDateString()
    };
}

function mapContent (options, results) {
    return {
        count: options.count,
        results: results.data.map(mapResult.bind(null, options.log))
    };
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
            name: result.name,
            runs: mapRuns(result)
        };
    } catch (error) {
        log.error('failed to map ' + message + '; ' + error.message);
        return result;
    }
}

function mapRuns (result) {
    var metricIndex, runs;

    metricIndex = 0;
    runs = [];

    views.forEach(function (view) {
        metrics.forEach(function (metric) {
            Object.keys(getRuns(metric)).forEach(
                setRunData.bind(null, view, metric)
            );
        });
    });

    return runs;

    function getRuns (metric) {
        return result[metric].data.runs;
    }

    function setRunData (view, metric, runId) {
        var runIndex = parseInt(runId) - 1;

        if (!runs[runIndex]) {
            runs[runIndex] = {
                id: result.id + '/' + runId,
                metrics: new Array(metricsLength)
            };
        }

        runs[runIndex].metrics[metricIndex] = getMetric(view, metric, runId);
        metricIndex = (metricIndex + 1) % metricsLength;
    }

    function getMetric (view, metric, runId) {
        var viewObject = getRuns(metric)[runId][view];

        if (!viewObject) {
            return '';
        }

        return viewObject[metric];
    }
}

