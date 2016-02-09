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

'use strict';

var assert, mockery, spooks, modulePath;

assert = require('chai').assert;
mockery = require('mockery');
spooks = require('spooks');

modulePath = '../src/templates';

mockery.registerAllowable(modulePath);
mockery.registerAllowable('check-types');

suite('templates:', function () {
    var log, results;

    setup(function () {
        log = {};
        results = {
            readFileSync: [],
            compile: []
        };

        mockery.enable({ useCleanCache: true });
        mockery.registerMock('fs', spooks.obj({
            archetype: { readFileSync: nop },
            log: log,
            results: results
        }));
        mockery.registerMock('handlebars', spooks.obj({
            archetype: { registerHelper: nop, compile: nop },
            log: log,
            results: results
        }));
    });

    teardown(function () {
        mockery.deregisterMock('fs');
        mockery.deregisterMock('handlebars');
        mockery.disable();

        log = results = undefined;
    });

    test('require does not throw', function () {
        assert.doesNotThrow(function () {
            require(modulePath);
        });
    });

    test('helpers were not registered', function () {
        assert.strictEqual(log.counts.registerHelper, 0);
    });

    suite('require:', function () {
        var templates;

        setup(function () {
            templates = require(modulePath);
        });

        teardown(function () {
            templates = undefined;
        });

        test('object was returned', function () {
            assert.isObject(templates);
        });

        test('one property is exported', function () {
            assert.lengthOf(Object.keys(templates), 1);
        });

        test('compile function is exported', function () {
            assert.isFunction(templates.compile);
        });

        test('compile throws with bad template path', function () {
            assert.throws(function () {
                templates.compile({ toString: function () { return 'foo'; } });
            });
        });

        test('compile does not throw with good template path', function () {
            assert.doesNotThrow(function () {
                templates.compile('foo');
            });
        });

        test('six helpers were registered', function () {
            assert.strictEqual(log.counts.registerHelper, 7);
            assert.strictEqual(log.these.registerHelper[0], require('handlebars'));
            assert.strictEqual(log.these.registerHelper[1], require('handlebars'));
            assert.strictEqual(log.these.registerHelper[2], require('handlebars'));
            assert.strictEqual(log.these.registerHelper[3], require('handlebars'));
            assert.strictEqual(log.these.registerHelper[4], require('handlebars'));
            assert.strictEqual(log.these.registerHelper[5], require('handlebars'));
            assert.strictEqual(log.these.registerHelper[6], require('handlebars'));
        });

        test('first helper was registered correctly', function () {
            assert.lengthOf(log.args.registerHelper[0], 2);
            assert.strictEqual(log.args.registerHelper[0][0], 'formatInteger');
            assert.isFunction(log.args.registerHelper[0][1]);
            assert.strictEqual(log.args.registerHelper[0][1](1), '1');
            assert.strictEqual(log.args.registerHelper[0][1](10), '10');
            assert.strictEqual(log.args.registerHelper[0][1](100), '100');
            assert.strictEqual(log.args.registerHelper[0][1](1000), '1,000');
            assert.strictEqual(log.args.registerHelper[0][1](10000), '10,000');
            assert.strictEqual(log.args.registerHelper[0][1](100000), '100,000');
            assert.strictEqual(log.args.registerHelper[0][1](1000000), '1,000,000');
        });

        test('second helper was registered correctly', function () {
            assert.lengthOf(log.args.registerHelper[1], 2);
            assert.strictEqual(log.args.registerHelper[1][0], 'add');
            assert.isFunction(log.args.registerHelper[1][1]);
            assert.notStrictEqual(log.args.registerHelper[0][1], log.args.registerHelper[1][1]);
            assert.strictEqual(log.args.registerHelper[1][1](1, 1), 2);
            assert.strictEqual(log.args.registerHelper[1][1](1, 2), 3);
        });

        test('third helper was registered correctly', function () {
            assert.lengthOf(log.args.registerHelper[2], 2);
            assert.strictEqual(log.args.registerHelper[2][0], 'minus');
            assert.isFunction(log.args.registerHelper[2][1]);
            assert.notStrictEqual(log.args.registerHelper[0][1], log.args.registerHelper[2][1]);
            assert.notStrictEqual(log.args.registerHelper[1][1], log.args.registerHelper[2][1]);
            assert.strictEqual(log.args.registerHelper[2][1](1, 1), 0);
            assert.strictEqual(log.args.registerHelper[2][1](1, 2), -1);
        });

        test('fourth helper was registered correctly', function () {
            assert.lengthOf(log.args.registerHelper[3], 2);
            assert.strictEqual(log.args.registerHelper[3][0], 'halve');
            assert.isFunction(log.args.registerHelper[3][1]);
            assert.notStrictEqual(log.args.registerHelper[0][1], log.args.registerHelper[3][1]);
            assert.notStrictEqual(log.args.registerHelper[1][1], log.args.registerHelper[3][1]);
            assert.notStrictEqual(log.args.registerHelper[2][1], log.args.registerHelper[3][1]);
            assert.strictEqual(log.args.registerHelper[3][1](1), 0.5);
            assert.strictEqual(log.args.registerHelper[3][1](2), 1);
        });

        test('fifth helper was registered correctly', function () {
            assert.lengthOf(log.args.registerHelper[4], 2);
            assert.strictEqual(log.args.registerHelper[4][0], 'percent');
            assert.isFunction(log.args.registerHelper[4][1]);
            assert.notStrictEqual(log.args.registerHelper[0][1], log.args.registerHelper[4][1]);
            assert.notStrictEqual(log.args.registerHelper[1][1], log.args.registerHelper[4][1]);
            assert.notStrictEqual(log.args.registerHelper[2][1], log.args.registerHelper[4][1]);
            assert.notStrictEqual(log.args.registerHelper[3][1], log.args.registerHelper[4][1]);
            assert.strictEqual(log.args.registerHelper[4][1](0), '0%');
            assert.strictEqual(log.args.registerHelper[4][1](100), '100%');
            assert.strictEqual(log.args.registerHelper[4][1](-1), 'n/a');
        });

        test('sixth helper was registered correctly', function () {
            assert.lengthOf(log.args.registerHelper[5], 2);
            assert.strictEqual(log.args.registerHelper[5][0], 'lowercase');
            assert.isFunction(log.args.registerHelper[5][1]);
            assert.notStrictEqual(log.args.registerHelper[0][1], log.args.registerHelper[5][1]);
            assert.notStrictEqual(log.args.registerHelper[1][1], log.args.registerHelper[5][1]);
            assert.notStrictEqual(log.args.registerHelper[2][1], log.args.registerHelper[5][1]);
            assert.notStrictEqual(log.args.registerHelper[3][1], log.args.registerHelper[5][1]);
            assert.notStrictEqual(log.args.registerHelper[4][1], log.args.registerHelper[5][1]);
            assert.strictEqual(log.args.registerHelper[5][1]('FOO'), 'foo');
            assert.strictEqual(log.args.registerHelper[5][1]('bar'), 'bar');
            assert.strictEqual(log.args.registerHelper[5][1]('baZ'), 'baz');
        });

        test('seventh helper was registered correctly', function () {
            assert.lengthOf(log.args.registerHelper[6], 2);
            assert.strictEqual(log.args.registerHelper[6][0], 'debug');
            assert.isFunction(log.args.registerHelper[6][1]);
            assert.notStrictEqual(log.args.registerHelper[0][1], log.args.registerHelper[6][1]);
            assert.notStrictEqual(log.args.registerHelper[1][1], log.args.registerHelper[6][1]);
            assert.notStrictEqual(log.args.registerHelper[2][1], log.args.registerHelper[6][1]);
            assert.notStrictEqual(log.args.registerHelper[3][1], log.args.registerHelper[6][1]);
            assert.notStrictEqual(log.args.registerHelper[4][1], log.args.registerHelper[6][1]);
            assert.notStrictEqual(log.args.registerHelper[5][1], log.args.registerHelper[6][1]);
            assert.isUndefined(log.args.registerHelper[6][1]('foo'));
        });

        test('fs.readFileSync was not called', function () {
            assert.strictEqual(log.counts.readFileSync, 0);
        });

        test('handlebars.compile was not called', function () {
            assert.strictEqual(log.counts.compile, 0);
        });

        suite('compile:', function () {
            var result;

            setup(function () {
                results.readFileSync[0] = 'foo';
                result = templates.compile('bar');
            });

            teardown(function () {
                result = undefined;
            });

            test('fs.readFileSync was called once', function () {
                assert.strictEqual(log.counts.readFileSync, 1);
                assert.strictEqual(log.these.readFileSync[0], require('fs'));
            });

            test('fs.readFileSync was called correctly', function () {
                assert.lengthOf(log.args.readFileSync[0], 2);
                assert.strictEqual(log.args.readFileSync[0][0], 'bar');
                assert.isObject(log.args.readFileSync[0][1]);
                assert.lengthOf(Object.keys(log.args.readFileSync[0][1]), 1);
                assert.strictEqual(log.args.readFileSync[0][1].encoding, 'utf8');
            });

            test('handlebars.compile was called once', function () {
                assert.strictEqual(log.counts.compile, 1);
                assert.strictEqual(log.these.compile[0], require('handlebars'));
            });

            test('handlebars.compile was called correctly', function () {
                assert.lengthOf(log.args.compile[0], 1);
                assert.strictEqual(log.args.compile[0][0], 'foo');
            });
        });
    });

    function nop () {};
});

