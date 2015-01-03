/*jshint nomen:false */
/*globals require, __dirname, module */

'use strict';

var path, fs, handlebars, render, packageInfo;

path = require('path');
fs = require('fs');
handlebars = require('handlebars');
handlebars.registerHelper('add', function (a, b) {
    return a + b;
});
render = handlebars.compile(
    fs.readFileSync(
        path.join(__dirname, 'template.html')
    ),
    { encoding: 'utf8' }
);
packageInfo = require('../../../package.json');

module.exports = {
    map: map
};

function map (options, results) {
    return render(mapResults(options, results));
}

function mapResults (options, results) {
    var runs = (new Array(results.options.count)).map(mapRun);

    return {
        application: packageInfo.name,
        version: packageInfo.version,
        results: (new Array(results.options.count)).map(mapResult.bind(null, results)),
    };
}

function mapResult (results, ignore, index) {
}

