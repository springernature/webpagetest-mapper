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

/*globals require, module */

'use strict';

var fs, handlebars, check;

fs = require('fs');
handlebars = require('handlebars');
check = require('check-types');

handlebars.registerHelper('formatInteger', function (number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
});
handlebars.registerHelper('add', function (lhs, rhs) {
    return lhs + rhs;
});
handlebars.registerHelper('minus', function (lhs, rhs) {
    return lhs - rhs;
});
handlebars.registerHelper('halve', function (number) {
    return number / 2;
});
handlebars.registerHelper('percent', function (number) {
    if (number === -1) {
        return 'n/a';
    }

    return number + '%';
});
handlebars.registerHelper('lowercase', function (string) {
    return string.toLowerCase();
});

module.exports = {
    compile: compile
};

function compile (templatePath) {
    check.assert.unemptyString(templatePath, 'invalid template path');

    return handlebars.compile(fs.readFileSync(templatePath, { encoding: 'utf8' }));
}

