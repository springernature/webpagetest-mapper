#!/usr/bin/env node

/*globals require, process, console */

'use strict';

var fs, path, cli, impl, options;

fs = require('fs');
path = require('path');
cli = require('commander');
impl = require('.');
options = require('./options');

options.cli.forEach(function (option) {
    cli.option(option.format, option.description, option.coercion);
});

cli.parse(process.argv);

impl.run(cli).then(function (result) {
    if (cli.output) {
        return fs.writeFileSync(
            path.resolve(cli.output),
            result,
            { encoding: 'utf8', mode: 420 }
        );
    }

    console.log(result);
}).catch(function (error) {
    console.log('Fatal error: ' + error.message);
    console.log(error.stack);
    process.exit(1);
});

