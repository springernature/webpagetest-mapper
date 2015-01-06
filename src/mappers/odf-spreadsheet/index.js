/*jshint nomen:false */
/*globals require, __dirname, module */

'use strict';

var path, fs, JSZip, handlebars, render,
    packageInfo, views, metrics, metricsLength;

path = require('path');
fs = require('fs');
JSZip = require('jszip');

handlebars = require('handlebars');
handlebars.registerHelper('add', function (a, b) {
    return a + b;
});

render = {
    meta: handlebars.compile(readFile('meta.xml')),
    content: handlebars.compile(readFile('content.xml'))
};

function readFile (name) {
    return fs.readFileSync(path.join(__dirname, name), { encoding: 'utf8' });
}

packageInfo = require('../../../package.json');

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
    zip.file('content.xml', render.content(mapContent(options.log, results)));

    return zip.generate({ compression: 'DEFLATE', type: 'nodebuffer' });
}

function mapMeta (results) {
    return {
        application: packageInfo.name,
        version: packageInfo.version,
        date: results.times.end.toLocaleDateString()
    };
}

function mapContent (log, results) {
    return {
        count: results.options.count,
        results: results.data.map(mapResult.bind(null, log))
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
        log.error('failed to map ' + message + ', ' + error.message);
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

        runs[runIndex].metrics[metricIndex] = getRuns(metric)[runId][view][metric];
        metricIndex = (metricIndex + 1) % metricsLength;
    }
}

