#!/usr/bin/env node

/*globals require */

'use strict';

var cli, impl, options;

cli = require('commander');
impl = require('.');
options = require('./options');

options.cli.forEach(function (option) {
    cli.option(option.format, option.description, option.coercion);
});

cli.parse(process.argv);

impl.run(cli);

