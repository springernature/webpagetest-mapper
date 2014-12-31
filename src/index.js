/*globals require, module */

'use strict';

var options;

options = require('./options');

module.exports = {
    run: run,
    fetch: fetch,
    map: map
};

function run (options) {
    map(options, fetch(options));
}

function fetch (options) {
    options.normalise(options);
}

function map (options) {
    options.normalise(options);
}

