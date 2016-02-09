#!/usr/bin/env node

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

/*globals require, __dirname, process, console */

'use strict';

var fs, path, cli, impl, options;

fs = require('fs');
path = require('path');
cli = require('commander');
impl = require(__dirname);
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
    console.log(error.stack);
    console.log('Fatal error, exiting.');
    process.exit(1);
});

