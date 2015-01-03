#!/usr/bin/env node

/*globals require, process */

'use strict';

var cli, impl, options;

cli = require('commander');
impl = require('.');
options = require('./options');

options.cli.forEach(function (option) {
    cli.option(option.format, option.description, option.coercion);
});

cli.parse(process.argv);

try {
    impl.run(cli);
} catch (error) {
    console.log('Fatal error: ' + error.message);
    process.exit(1);
}

