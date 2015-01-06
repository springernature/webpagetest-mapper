/*jshint nomen:false */
/*globals require, __dirname, module */

'use strict';

var path, fs, handlebars, render, packageInfo, views, metrics, metricsLength;

path = require('path');
fs = require('fs');
handlebars = require('handlebars');
handlebars.registerHelper('add', function (a, b) {
    return a + b;
});
render = handlebars.compile(
    fs.readFileSync(
        path.join(__dirname, 'template.xml'),
        { encoding: 'utf8' }
    )
);
packageInfo = require('../../../package.json');

views = [ 'firstView', 'repeatView' ];
metrics = [ 'TTFB', 'render', 'loadTime', 'SpeedIndex' ];
metricsLength = views.length * metrics.length;

module.exports = {
    map: map
};

function map (options, results) {
    return render(mapResults(options, results));
}

function mapResults (options, results) {
    return {
        application: packageInfo.name,
        version: packageInfo.version,
        date: results.times.end.toLocaleDateString(),
        count: results.options.count,
        results: results.data.map(mapResult)
    };
}

function mapResult (result) {
    return {
        id: result.label,
        name: result.name,
        runs: mapRuns(result)
    };
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

