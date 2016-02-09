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

modulePath = '../src/options';

mockery.registerAllowable(modulePath);
mockery.registerAllowable('check-types');

suite('options:', function () {
    var log, results, mappers;

    setup(function () {
        log = {};
        results = {
            resolve: [],
            existsSync: [],
            statSync: [],
            isFile: [],
            readFileSync: [],
            initialise: []
        };
        mappers = {
            svg: {},
            odf: {}
        };

        mockery.enable({ useCleanCache: true });
        mockery.registerMock('path', spooks.obj({
            archetype: { resolve: nop },
            log: log,
            results: results
        }));
        mockery.registerMock('fs', spooks.obj({
            archetype: { existsSync: nop, statSync: nop, readFileSync: nop },
            log: log,
            results: results
        }));
        mockery.registerMock('get-off-my-log', spooks.obj({
            archetype: { initialise: nop },
            log: log,
            results: results
        }));
        mockery.registerMock('./mappers/html-comparison', mappers.svg);
        mockery.registerMock('./mappers/odf-spreadsheet', mappers.odf);

        results.statSync[0] = {
            isFile: spooks.fn({ name: 'isFile', log: log, results: results.isFile })
        };
        results.initialise[0] = spooks.obj({
            archetype: { info: nop, warn: nop, error: nop },
            log: log,
            results: results
        });
    });

    teardown(function () {
        mockery.deregisterMock('./mappers/odf-spreadsheet');
        mockery.deregisterMock('./mappers/html-comparison');
        mockery.deregisterMock('get-off-my-log');
        mockery.deregisterMock('fs');
        mockery.deregisterMock('path');
        mockery.disable();

        log = results = mappers = undefined;
    });

    test('require does not throw', function () {
        assert.doesNotThrow(function () {
            require(modulePath);
        });
    });

    test('require returns object', function () {
        assert.isObject(require(modulePath));
    });

    suite('require:', function () {
        var options;

        setup(function () {
            options = require(modulePath);
        });

        teardown(function () {
            options = undefined;
        });

        test('cli array is exported', function () {
            assert.isArray(options.cli);
            assert.lengthOf(options.cli, 16);
        });

        test('cli options seem correct', function () {
            options.cli.forEach(function (option) {
                assert.isString(option.format);
                assert.match(option.format, /^-[a-z], --[a-zA-Z]+( <[a-zA-Z]+>)?$/);
                assert.isString(option.description);
                assert.match(option.description, /^[a-z-]+ [a-zA-Z0-9 ,`:\.\/-]+$/);

                if (option.coercion !== undefined) {
                    assert.isFunction(option.coercion);
                }
            });
        });

        test('normalise function is exported', function () {
            assert.isFunction(options.normalise);
        });

        test('get object is exported', function () {
            assert.isObject(options.get);
        });

        test('get.log function is exported', function () {
            assert.isFunction(options.get.log);
        });

        test('get.results function is exported', function () {
            assert.isFunction(options.get.results);
        });

        test('get.mapper function is exported', function () {
            assert.isFunction(options.get.mapper);
        });

        suite('with JSON file config:', function () {
            setup(function () {
                results.resolve[0] = 'wibble';
                results.existsSync[0] = results.isFile[0] = true;
                results.readFileSync[0] = '{"foo":"bar","baz":"qux"}';
                results.readFileSync[1] = '["foo","bar","baz","qux"]';
            });

            test('normalise throws without options', function () {
                assert.throws(function () {
                    options.normalise();
                });
            });

            test('normalise does not throw with empty options', function () {
                assert.doesNotThrow(function () {
                    options.normalise({});
                });
            });

            test('normalise throws with non-object log option', function () {
                assert.throws(function () {
                    options.normalise({ log: console.log });
                });
            });

            test('normalise throws with missing log.info function', function () {
                assert.throws(function () {
                    options.normalise({ log: { warn: nop, error: nop } });
                });
            });

            test('normalise throws with missing log.warn function', function () {
                assert.throws(function () {
                    options.normalise({ log: { info: nop, error: nop } });
                });
            });

            test('normalise throws with missing log.error function', function () {
                assert.throws(function () {
                    options.normalise({ log: { info: nop, warn: nop } });
                });
            });

            test('normalise does not throw valid log option', function () {
                assert.doesNotThrow(function () {
                    options.normalise({ log: { info: nop, warn: nop, error: nop } });
                });
            });

            suite('normalise with empty options:', function () {
                var normalised;

                setup(function () {
                    normalised = options.normalise({});
                });

                teardown(function () {
                    normalised = undefined;
                });

                test('path.resolve was called twice', function () {
                    assert.strictEqual(log.counts.resolve, 2);
                });

                test('path.resolve was called correctly first time', function () {
                    assert.strictEqual(log.these.resolve[0], require('path'));
                    assert.lengthOf(log.args.resolve[0], 1);
                    assert.strictEqual(log.args.resolve[0][0], '.wptrc');
                });

                test('path.resolve was called correctly second time', function () {
                    assert.strictEqual(log.these.resolve[0], require('path'));
                    assert.lengthOf(log.args.resolve[0], 1);
                    assert.strictEqual(log.args.resolve[1][0], 'tests.json');
                });

                test('fs.existsSync was called twice', function () {
                    assert.strictEqual(log.counts.existsSync, 2);
                });

                test('fs.existsSync was called correctly first time', function () {
                    assert.strictEqual(log.these.existsSync[0], require('fs'));
                    assert.lengthOf(log.args.existsSync[0], 1);
                    assert.strictEqual(log.args.existsSync[0][0], 'wibble');
                });

                test('fs.existsSync was called correctly second time', function () {
                    assert.strictEqual(log.these.existsSync[1], require('fs'));
                    assert.lengthOf(log.args.existsSync[1], 1);
                    assert.strictEqual(log.args.existsSync[1][0], 'wibble');
                });

                test('fs.statSync was called twice', function () {
                    assert.strictEqual(log.counts.statSync, 2);
                });

                test('fs.statSync was called correctly first time', function () {
                    assert.strictEqual(log.these.statSync[0], require('fs'));
                    assert.lengthOf(log.args.statSync[0], 1);
                    assert.strictEqual(log.args.statSync[0][0], 'wibble');
                });

                test('fs.statSync was called correctly second time', function () {
                    assert.strictEqual(log.these.statSync[1], require('fs'));
                    assert.lengthOf(log.args.statSync[1], 1);
                    assert.strictEqual(log.args.statSync[1][0], 'wibble');
                });

                test('stat.isFile was called twice', function () {
                    assert.strictEqual(log.counts.isFile, 2);
                });

                test('stat.isFile was called correctly first time', function () {
                    assert.strictEqual(log.these.isFile[0], results.statSync[0]);
                    assert.lengthOf(log.args.isFile[0], 0);
                });

                test('stat.isFile was called correctly second time', function () {
                    assert.strictEqual(log.these.isFile[1], results.statSync[0]);
                    assert.lengthOf(log.args.isFile[1], 0);
                });

                test('fs.readFileSync was called twice', function () {
                    assert.strictEqual(log.counts.readFileSync, 2);
                });

                test('fs.readFileSync was called correctly first time', function () {
                    assert.strictEqual(log.these.readFileSync[0], require('fs'));
                    assert.lengthOf(log.args.readFileSync[0], 1);
                    assert.strictEqual(log.args.readFileSync[0][0], 'wibble');
                });

                test('fs.readFileSync was called correctly second time', function () {
                    assert.strictEqual(log.these.readFileSync[1], require('fs'));
                    assert.lengthOf(log.args.readFileSync[1], 1);
                    assert.strictEqual(log.args.readFileSync[1][0], 'wibble');
                });

                test('get-off-my-log.initialise was called once', function () {
                    assert.strictEqual(log.counts.initialise, 1);
                });

                test('get-off-my-log.initialise was called correctly', function () {
                    assert.strictEqual(log.these.initialise[0], require('get-off-my-log'));
                    assert.lengthOf(log.args.initialise[0], 2);
                    assert.strictEqual(log.args.initialise[0][0], 'webpagetest-mapper');
                    assert.strictEqual(log.args.initialise[0][1], console.log);
                });

                test('normalised object has correct number of keys', function () {
                    assert.lengthOf(Object.keys(normalised), 16);
                });

                test('normalised.foo is undefined', function () {
                    assert.isUndefined(normalised.foo);
                });

                test('normalised.baz is undefined', function () {
                    assert.isUndefined(normalised.baz);
                });

                test('normalised.uri is correct', function () {
                    assert.strictEqual(normalised.uri, 'www.webpagetest.org');
                });

                test('normalised.location is correct', function () {
                    assert.strictEqual(normalised.location, 'Dulles:Chrome');
                });

                test('normalised.connection is correct', function () {
                    assert.strictEqual(normalised.connection, 'Native Connection');
                });

                test('normalised.tests is correct', function () {
                    assert.isArray(normalised.tests);
                    assert.lengthOf(normalised.tests, 4);
                    assert.strictEqual(normalised.tests[0], 'foo');
                    assert.strictEqual(normalised.tests[1], 'bar');
                    assert.strictEqual(normalised.tests[2], 'baz');
                    assert.strictEqual(normalised.tests[3], 'qux');
                });

                test('normalised.count is correct', function () {
                    assert.strictEqual(normalised.count, 9);
                });

                test('normalised.resultIds is correct', function () {
                    assert.isUndefined(normalised.resultIds);
                });

                test('normalised.mapper is correct', function () {
                    assert.strictEqual(normalised.mapper, mappers.svg);
                });

                test('normalised.silent is correct', function () {
                    assert.isUndefined(normalised.silent);
                });

                test('normalised.syslog is undefined', function () {
                    assert.isUndefined(normalised.syslog);
                });

                test('normalised.log is correct', function () {
                    assert.isObject(normalised.log);
                    assert.lengthOf(Object.keys(normalised.log), 3);
                    assert.isFunction(normalised.log.info);
                    assert.isFunction(normalised.log.warn);
                    assert.isFunction(normalised.log.error);
                });

                test('normalised.config is undefined', function () {
                    assert.isUndefined(normalised.config);
                });

                test('normalised.normalised is true', function () {
                    assert.isTrue(normalised.normalised);
                });

                suite('normalise:', function () {
                    setup(function () {
                        normalised = options.normalise(normalised);
                    });

                    test('path.resolve was not called', function () {
                        assert.strictEqual(log.counts.resolve, 2);
                    });

                    test('fs.existsSync was not called', function () {
                        assert.strictEqual(log.counts.existsSync, 2);
                    });

                    test('fs.statSync was not called', function () {
                        assert.strictEqual(log.counts.statSync, 2);
                    });

                    test('stat.isFile was not called', function () {
                        assert.strictEqual(log.counts.isFile, 2);
                    });

                    test('fs.readFileSync was not called', function () {
                        assert.strictEqual(log.counts.readFileSync, 2);
                    });

                    test('get-off-my-log.initialise was not called', function () {
                        assert.strictEqual(log.counts.initialise, 1);
                    });

                    test('normalised object has correct number of keys', function () {
                        assert.lengthOf(Object.keys(normalised), 16);
                    });

                    test('normalised.foo is undefined', function () {
                        assert.isUndefined(normalised.foo);
                    });

                    test('normalised.baz is undefined', function () {
                        assert.isUndefined(normalised.baz);
                    });

                    test('normalised.uri is correct', function () {
                        assert.strictEqual(normalised.uri, 'www.webpagetest.org');
                    });

                    test('normalised.location is correct', function () {
                        assert.strictEqual(normalised.location, 'Dulles:Chrome');
                    });

                    test('normalised.connection is correct', function () {
                        assert.strictEqual(normalised.connection, 'Native Connection');
                    });

                    test('normalised.tests is correct', function () {
                        assert.isArray(normalised.tests);
                        assert.lengthOf(Object.keys(normalised.tests), 4);
                    });

                    test('normalised.count is correct', function () {
                        assert.strictEqual(normalised.count, 9);
                    });

                    test('normalised.resultIds is correct', function () {
                        assert.isUndefined(normalised.resultIds);
                    });

                    test('normalised.mapper is correct', function () {
                        assert.strictEqual(normalised.mapper, mappers.svg);
                    });

                    test('normalised.silent is correct', function () {
                        assert.isUndefined(normalised.silent);
                    });

                    test('normalised.syslog is undefined', function () {
                        assert.isUndefined(normalised.syslog);
                    });

                    test('normalised.log is correct', function () {
                        assert.isObject(normalised.log);
                    });

                    test('normalised.config is undefined', function () {
                        assert.isUndefined(normalised.config);
                    });

                    test('normalised.normalised is true', function () {
                        assert.isTrue(normalised.normalised);
                    });
                });
            });

            suite('normalise with options:', function () {
                var normalised;

                setup(function () {
                    results.readFileSync[2] = '{"data":[],"options":{},"times":{"begin":"2015-01-04T14:55:08.577Z","end":"2015-01-04T14:55:08.578Z"}}';
                    normalised = options.normalise({
                        uri: 'foo',
                        location: 'bar',
                        connection: 'baz',
                        tests: 'qux',
                        count: 'wibble',
                        results: 'wobble',
                        resultIds: 'a,bc,de-fg,hijk/12',
                        mapper: 'odf-spreadsheet',
                        silent: true,
                        log: nop,
                        foo: '',
                        something: 'else'
                    });
                });

                teardown(function () {
                    normalised = undefined;
                });

                test('path.resolve was called three times', function () {
                    assert.strictEqual(log.counts.resolve, 3);
                });

                test('path.resolve was called correctly first time', function () {
                    assert.strictEqual(log.args.resolve[0][0], '.wptrc');
                });

                test('path.resolve was called correctly second time', function () {
                    assert.strictEqual(log.args.resolve[1][0], 'qux');
                });

                test('path.resolve was called correctly third time', function () {
                    assert.strictEqual(log.args.resolve[2][0], 'wobble');
                });

                test('fs.existsSync was called three times', function () {
                    assert.strictEqual(log.counts.existsSync, 3);
                });

                test('fs.statSync was called three times', function () {
                    assert.strictEqual(log.counts.statSync, 3);
                });

                test('stat.isFile was called three times', function () {
                    assert.strictEqual(log.counts.isFile, 3);
                });

                test('fs.readFileSync was called three times', function () {
                    assert.strictEqual(log.counts.readFileSync, 3);
                });

                test('get-off-my-log.initialise was not called', function () {
                    assert.strictEqual(log.counts.initialise, 0);
                });

                test('normalised object has correct number of keys', function () {
                    assert.lengthOf(Object.keys(normalised), 16);
                });

                test('normalised.foo is undefined', function () {
                    assert.isUndefined(normalised.foo);
                });

                test('normalised.baz is undefined', function () {
                    assert.isUndefined(normalised.baz);
                });

                test('normalised.uri is correct', function () {
                    assert.strictEqual(normalised.uri, 'foo');
                });

                test('normalised.location is correct', function () {
                    assert.strictEqual(normalised.location, 'bar');
                });

                test('normalised.connection is correct', function () {
                    assert.strictEqual(normalised.connection, 'baz');
                });

                test('normalised.tests is correct', function () {
                    assert.isArray(normalised.tests);
                    assert.lengthOf(normalised.tests, 4);
                });

                test('normalised.count is correct', function () {
                    assert.strictEqual(normalised.count, 'wibble');
                });

                test('normalised.resultIds is correct', function () {
                    assert.isArray(normalised.resultIds);
                    assert.lengthOf(normalised.resultIds, 4);

                    assert.isObject(normalised.resultIds[0]);
                    assert.lengthOf(Object.keys(normalised.resultIds[0]), 1);
                    assert.strictEqual(normalised.resultIds[0].id, 'a');

                    assert.isObject(normalised.resultIds[1]);
                    assert.lengthOf(Object.keys(normalised.resultIds[1]), 1);
                    assert.strictEqual(normalised.resultIds[1].id, 'bc');

                    assert.isObject(normalised.resultIds[2]);
                    assert.lengthOf(Object.keys(normalised.resultIds[2]), 1);
                    assert.strictEqual(normalised.resultIds[2].id, 'de-fg');

                    assert.isObject(normalised.resultIds[3]);
                    assert.lengthOf(Object.keys(normalised.resultIds[3]), 1);
                    assert.strictEqual(normalised.resultIds[3].id, 'hijk/12');
                });

                test('normalised.mapper is correct', function () {
                    assert.strictEqual(normalised.mapper, mappers.odf);
                });

                test('normalised.silent is correct', function () {
                    assert.isTrue(normalised.silent);
                });

                test('normalised.syslog is undefined', function () {
                    assert.isUndefined(normalised.syslog);
                });

                test('normalised.log is correct', function () {
                    assert.isObject(normalised.log);
                    assert.lengthOf(Object.keys(normalised.log), 3);
                    assert.isFunction(normalised.log.info);
                    assert.isFunction(normalised.log.warn);
                    assert.isFunction(normalised.log.error);
                });

                test('normalised.something is correct', function () {
                    assert.isUndefined(normalised.something);
                });

                test('normalised.normalised is true', function () {
                    assert.isTrue(normalised.normalised);
                });
            });

            suite('normalise with tests array:', function () {
                var normalised;

                setup(function () {
                    results.readFileSync[2] = '{"data":[],"options":{},"times":{"begin":"2015-01-04T14:55:08.577Z","end":"2015-01-04T14:55:08.578Z"}}';
                    normalised = options.normalise({
                        tests: ["a", "b", "c", "d"]
                    });
                });

                teardown(function () {
                    normalised = undefined;
                });

                test('path.resolve was only called once', function () {
                    assert.strictEqual(log.counts.resolve, 1);
                });

                test('normalised.tests is the correct array', function () {
                    assert.deepEqual(normalised.tests, ["a", "b", "c", "d"]);
                });

            });

            suite('normalise with config:', function () {
                var normalised;

                setup(function () {
                    normalised = options.normalise({ config: 'mahumba' });
                });

                teardown(function () {
                    normalised = undefined;
                });

                test('path.resolve was called twice', function () {
                    assert.strictEqual(log.counts.resolve, 2);
                });

                test('path.resolve was called correctly first time', function () {
                    assert.strictEqual(log.args.resolve[0][0], 'mahumba');
                });

                test('path.resolve was called correctly second time', function () {
                    assert.strictEqual(log.args.resolve[1][0], 'tests.json');
                });

                test('fs.existsSync was called twice', function () {
                    assert.strictEqual(log.counts.existsSync, 2);
                });

                test('fs.statSync was called twice', function () {
                    assert.strictEqual(log.counts.statSync, 2);
                });

                test('stat.isFile was called twice', function () {
                    assert.strictEqual(log.counts.isFile, 2);
                });

                test('fs.readFileSync was called twice', function () {
                    assert.strictEqual(log.counts.readFileSync, 2);
                });

                test('get-off-my-log.initialise was called once', function () {
                    assert.strictEqual(log.counts.initialise, 1);
                });

                test('normalised object has correct number of keys', function () {
                    assert.lengthOf(Object.keys(normalised), 16);
                });

                test('normalised.config is undefined', function () {
                    assert.isUndefined(normalised.config);
                });

                test('normalised.normalised is true', function () {
                    assert.isTrue(normalised.normalised);
                });
            });

            test('get.log throws without options', function () {
                assert.throws(function () {
                    options.get.log();
                });
            });

            test('get.log does not throw with empty options', function () {
                assert.doesNotThrow(function () {
                    options.get.log({});
                });
            });

            test('get.log throws with non-object log option', function () {
                assert.throws(function () {
                    options.get.log({ log: console.log });
                });
            });

            test('get.log throws with missing log.info function', function () {
                assert.throws(function () {
                    options.get.log({ log: { warn: nop, error: nop } });
                });
            });

            test('get.log throws with missing log.warn function', function () {
                assert.throws(function () {
                    options.get.log({ log: { info: nop, error: nop } });
                });
            });

            test('get.log throws with missing log.error function', function () {
                assert.throws(function () {
                    options.get.log({ log: { info: nop, warn: nop } });
                });
            });

            test('get.log does not throw valid log option', function () {
                assert.doesNotThrow(function () {
                    options.get.log({ log: { info: nop, warn: nop, error: nop } });
                });
            });

            suite('get.log with silent:', function () {
                var result;

                setup(function () {
                    result = options.get.log({ silent: true });
                });

                teardown(function () {
                    result = undefined;
                });

                test('result is log object', function () {
                    assert.isObject(result);
                    assert.isFunction(result.info);
                    assert.isFunction(result.warn);
                    assert.isFunction(result.error);
                });
            });

            suite('get.log without silent:', function () {
                var result;

                setup(function () {
                    result = options.get.log({});
                });

                teardown(function () {
                    result = undefined;
                });

                test('get-off-my-log.initialise was called once', function () {
                    assert.strictEqual(log.counts.initialise, 1);
                });

                test('get-off-my-log.initialise was called correctly', function () {
                    assert.strictEqual(log.these.initialise[0], require('get-off-my-log'));
                    assert.lengthOf(log.args.initialise[0], 2);
                    assert.strictEqual(log.args.initialise[0][0], 'webpagetest-mapper');
                    assert.strictEqual(log.args.initialise[0][1], console.log);
                });

                test('result is log object', function () {
                    assert.isObject(result);
                    assert.isFunction(result.info);
                    assert.isFunction(result.warn);
                    assert.isFunction(result.error);
                });
            });
        });

        suite('with non-existent config:', function () {
            setup(function () {
                results.resolve[0] = 'the quick brown fox jumps over the lazy dog';
                results.existsSync[0] = false;
                results.existsSync[1] = true;
                results.isFile[0] = true;
                results.readFileSync[0] = '[]';
            });

            suite('normalise with empty options:', function () {
                var normalised;

                setup(function () {
                    normalised = options.normalise({});
                });

                teardown(function () {
                    normalised = undefined;
                });

                test('path.resolve was called twice', function () {
                    assert.strictEqual(log.counts.resolve, 2);
                });

                test('fs.existsSync was called twice', function () {
                    assert.strictEqual(log.counts.existsSync, 2);
                });

                test('fs.existsSync was called correctly first time', function () {
                    assert.strictEqual(log.args.existsSync[0][0], 'the quick brown fox jumps over the lazy dog');
                });

                test('fs.existsSync was called correctly second time', function () {
                    assert.strictEqual(log.args.existsSync[1][0], 'the quick brown fox jumps over the lazy dog');
                });

                test('fs.statSync called once', function () {
                    assert.strictEqual(log.counts.statSync, 1);
                });

                test('stat.isFile was called once', function () {
                    assert.strictEqual(log.counts.isFile, 1);
                });

                test('fs.readFileSync was called once', function () {
                    assert.strictEqual(log.counts.readFileSync, 1);
                });

                test('get-off-my-log.initialise was called once', function () {
                    assert.strictEqual(log.counts.initialise, 1);
                });

                test('normalised object has correct number of keys', function () {
                    assert.lengthOf(Object.keys(normalised), 16);
                });

                test('normalised.uri is correct', function () {
                    assert.strictEqual(normalised.uri, 'www.webpagetest.org');
                });

                test('normalised.location is correct', function () {
                    assert.strictEqual(normalised.location, 'Dulles:Chrome');
                });

                test('normalised.connection is correct', function () {
                    assert.strictEqual(normalised.connection, 'Native Connection');
                });

                test('normalised.tests is correct', function () {
                    assert.isArray(normalised.tests);
                    assert.lengthOf(normalised.tests, 0);
                });

                test('normalised.count is correct', function () {
                    assert.strictEqual(normalised.count, 9);
                });

                test('normalised.resultIds is correct', function () {
                    assert.isUndefined(normalised.resultIds);
                });

                test('normalised.mapper is correct', function () {
                    assert.strictEqual(normalised.mapper, mappers.svg);
                });

                test('normalised.silent is correct', function () {
                    assert.isUndefined(normalised.silent);
                });

                test('normalised.syslog is undefined', function () {
                    assert.isUndefined(normalised.syslog);
                });

                test('normalised.log is correct', function () {
                    assert.isObject(normalised.log);
                    assert.lengthOf(Object.keys(normalised.log), 3);
                    assert.isFunction(normalised.log.info);
                    assert.isFunction(normalised.log.warn);
                    assert.isFunction(normalised.log.error);
                });

                test('normalised.normalised is true', function () {
                    assert.isTrue(normalised.normalised);
                });
            });
        });

        suite('with non-JSON config:', function () {
            var normalised;

            setup(function () {
                results.resolve[0] = 'wibble';
                results.existsSync[0] = results.isFile[0] = true;
                results.readFileSync[0] = 'foo';
                normalised = {};
            });

            teardown(function () {
                normalised = undefined;
            });

            test('normalise fails with empty options', function () {
                assert.throws(function () {
                    options.normalise(normalised);
                });
                assert.isUndefined(normalised.normalised);
            });
        });

        suite('with non-object config:', function () {
            setup(function () {
                results.resolve[0] = 'wibble';
                results.existsSync[0] = results.isFile[0] = true;
                results.readFileSync[0] = '[]';
            });

            test('normalise throws', function () {
                assert.throws(function () {
                    options.normalise({});
                });
            });

            test('error message is correct', function () {
                try {
                    options.normalise({});
                } catch (error) {
                    assert.strictEqual(error.message, 'invalid options');
                }
            });
        });

        suite('with non-array tests:', function () {
            setup(function () {
                results.resolve[0] = 'wibble';
                results.existsSync[0] = results.isFile[0] = true;
                results.readFileSync[0] = '{}';
            });

            test('normalise throws', function () {
                assert.throws(function () {
                    options.normalise({});
                });
            });

            test('error message is correct for bad tests option', function () {
                try {
                    options.normalise({});
                } catch (error) {
                    assert.strictEqual(error.message, 'invalid option `tests`');
                }
            });

            test('error message is correct for bad results option', function () {
                try {
                    options.normalise({ results: 'wibble' });
                } catch (error) {
                    assert.strictEqual(error.message, 'invalid option `results`');
                }
            });
        });

        suite('with non-array result data:', function () {
            setup(function () {
                results.resolve[0] = 'wibble';
                results.existsSync[0] = results.isFile[0] = true;
                results.readFileSync[0] = '{}';
                results.readFileSync[1] = '[]';
                results.readFileSync[2] = '{"data":{},"options":{},"times":{"begin":"2015-01-04T14:55:08.577Z","end":"2015-01-04T14:55:08.578Z"}}';
            });

            test('normalise throws', function () {
                assert.throws(function () {
                    options.normalise({ results: 'wibble' });
                });
            });

            test('error message is correct', function () {
                try {
                    options.normalise({ results: 'wibble' });
                } catch (error) {
                    assert.strictEqual(error.message, 'invalid option `results`');
                }
            });
        });

        suite('with non-object result options:', function () {
            setup(function () {
                results.resolve[0] = 'wibble';
                results.existsSync[0] = results.isFile[0] = true;
                results.readFileSync[0] = '{}';
                results.readFileSync[1] = '[]';
                results.readFileSync[2] = '{"data":[],"options":[],"times":{"begin":"2015-01-04T14:55:08.577Z","end":"2015-01-04T14:55:08.578Z"}}';
            });

            test('normalise throws', function () {
                assert.throws(function () {
                    options.normalise({ results: 'wibble' });
                });
            });

            test('error message is correct', function () {
                try {
                    options.normalise({ results: 'wibble' });
                } catch (error) {
                    assert.strictEqual(error.message, 'invalid option `results`');
                }
            });
        });

        suite('with non-object result times:', function () {
            setup(function () {
                results.resolve[0] = 'wibble';
                results.existsSync[0] = results.isFile[0] = true;
                results.readFileSync[0] = '{}';
                results.readFileSync[1] = '[]';
                results.readFileSync[2] = '{"data":[],"options":{},"times":["2015-01-04T14:55:08.577Z","2015-01-04T14:55:08.578Z"]}';
            });

            test('normalise throws', function () {
                assert.throws(function () {
                    options.normalise({ results: 'wibble' });
                });
            });

            test('error message is correct', function () {
                try {
                    options.normalise({ results: 'wibble' });
                } catch (error) {
                    assert.strictEqual(error.message, 'invalid option `results`');
                }
            });
        });

        suite('with non-date begin time:', function () {
            setup(function () {
                results.resolve[0] = 'wibble';
                results.existsSync[0] = results.isFile[0] = true;
                results.readFileSync[0] = '{}';
                results.readFileSync[1] = '[]';
                results.readFileSync[2] = '{"data":[],"options":{},"times":{"begin":"wibble","end":"2015-01-04T14:55:08.578Z"}}';
            });

            test('normalise throws', function () {
                assert.throws(function () {
                    options.normalise({ results: 'wibble' });
                });
            });

            test('error message is correct', function () {
                try {
                    options.normalise({ results: 'wibble' });
                } catch (error) {
                    assert.strictEqual(error.message, 'invalid option `results`');
                }
            });
        });

        suite('with non-date end time:', function () {
            setup(function () {
                results.resolve[0] = 'wibble';
                results.existsSync[0] = results.isFile[0] = true;
                results.readFileSync[0] = '{}';
                results.readFileSync[1] = '[]';
                results.readFileSync[2] = '{"data":[],"options":{},"times":{"begin":"2015-01-04T14:55:08.577Z","end":"wibble"}}';
            });

            test('normalise throws', function () {
                assert.throws(function () {
                    options.normalise({ results: 'wibble' });
                });
            });

            test('error message is correct', function () {
                try {
                    options.normalise({ results: 'wibble' });
                } catch (error) {
                    assert.strictEqual(error.message, 'invalid option `results`');
                }
            });
        });

        suite('with valid results JSON', function () {
            setup(function () {
                results.resolve[0] = 'stuff';
                results.existsSync[0] = true;
                results.isFile[0] = true;
                results.readFileSync[0] = '{"data":[],"options":{},"times":{"begin":"2015-01-07T16:09:25.228Z","end":"2015-01-07T16:09:25.229Z"}}';
            });

            test('get.results throws without options', function () {
                assert.throws(function () {
                    options.get.results();
                });
            });

            test('get.results does not throw with empty options', function () {
                assert.doesNotThrow(function () {
                    options.get.results({});
                });
            });

            suite('get.results with results:', function () {
                var result;

                setup(function () {
                    result = options.get.results({ results: 'wibble' });
                });

                teardown(function () {
                    result = undefined;
                });

                test('path.resolve was called once', function () {
                    assert.strictEqual(log.counts.resolve, 1);
                });

                test('path.resolve was called correctly', function () {
                    assert.strictEqual(log.args.resolve[0][0], 'wibble');
                });

                test('fs.existsSync was called once', function () {
                    assert.strictEqual(log.counts.existsSync, 1);
                });

                test('fs.statSync was called once', function () {
                    assert.strictEqual(log.counts.statSync, 1);
                });

                test('stat.isFile was called once', function () {
                    assert.strictEqual(log.counts.isFile, 1);
                });

                test('fs.readFileSync was called once', function () {
                    assert.strictEqual(log.counts.readFileSync, 1);
                });

                test('result is correct', function () {
                    assert.isObject(result);
                    assert.isArray(result.data);
                    assert.isObject(result.options);
                    assert.isObject(result.times);
                    assert.instanceOf(result.times.begin, Date);
                    assert.instanceOf(result.times.end, Date);
                });
            });
        });
    });

    function nop () {};
});

