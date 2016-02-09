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

modulePath = '../src/index';

mockery.registerAllowable(modulePath);

suite('index:', function () {
    var log, results;

    setup(function () {
        log = {};
        results = {
            normalise: [],
            runTests: [],
            getResults: [],
            resolve: [],
            write: []
        };

        mockery.enable({ useCleanCache: true });
        mockery.registerMock('bfj', spooks.obj({
            archetype: { write: nop },
            log: log,
            results: results
        }));
        mockery.registerMock('path', spooks.obj({
            archetype: { resolve: nop },
            log: log,
            results: results
        }));
        mockery.registerMock('./options', spooks.obj({
            archetype: {
                normalise: nop,
                get: spooks.obj({
                    archetype: { results: nop, log: nop, mapper: nop },
                    log: log,
                    results: results
                })
            },
            log: log,
            results: results
        }));
        mockery.registerMock('./webpagetest', spooks.obj({
            archetype: { runTests: nop, getResults: nop },
            log: log,
            results: results
        }));
    });

    teardown(function () {
        mockery.deregisterMock('./webpagetest');
        mockery.deregisterMock('./options');
        mockery.deregisterMock('path');
        mockery.deregisterMock('bfj');
        mockery.disable();

        log = results = undefined;
    });

    test('require does not throw', function () {
        assert.doesNotThrow(function () {
            require(modulePath);
        });
    });

    test('require returns object', function () {
        assert.isObject(require(modulePath));
    });

    suite('index:', function () {
        var index;

        setup(function () {
            index = require(modulePath);
        });

        teardown(function () {
            index = undefined;
        });

        test('fetch function is exported', function () {
            assert.isFunction(index.fetch);
        });

        test('fetch does not throw', function () {
            assert.doesNotThrow(function () {
                index.fetch();
            });
        });

        test('fetch returns promise', function () {
            assert.instanceOf(index.fetch(), Promise);
        });

        test('options.normalise was not called', function () {
            assert.strictEqual(log.counts.normalise, 0);
        });

        test('webpagetest.runTests was not called', function () {
            assert.strictEqual(log.counts.runTests, 0);
        });

        suite('fetch:', function () {
            var runTests, getResults, resolved, rejected, result, error, done;

            setup(function () {
                runTests = {};
                getResults = {};

                results.normalise[0] = 'bar';
                results.runTests[0] = new Promise(function (resolve, reject) {
                    runTests.resolve = resolve;
                    runTests.reject = reject;
                });
                results.getResults[0] = new Promise(function (resolve, reject) {
                    getResults.resolve = resolve;
                    getResults.reject = reject;
                });

                resolved = rejected = false;

                index.fetch('foo').then(function (r) {
                    resolved = true;
                    result = r;
                    if (done) {
                        done();
                    }
                }).catch(function (e) {
                    rejected = true;
                    error = e;
                    if (done) {
                        done();
                    }
                });
            });

            teardown(function () {
                resolved = rejected = result = error = done = undefined;
            });

            test('options.normalise was called once', function () {
                assert.strictEqual(log.counts.normalise, 1);
            });

            test('options.normalise was called correctly', function () {
                assert.lengthOf(log.args.normalise[0], 1);
                assert.strictEqual(log.args.normalise[0][0], 'foo');
            });

            test('webpagetest.runTests was called once', function () {
                assert.strictEqual(log.counts.runTests, 1);
                assert.strictEqual(log.these.runTests[0], require('./webpagetest'));
            });

            test('webpagetest.runTests was called correctly', function () {
                assert.lengthOf(log.args.runTests[0], 1);
                assert.strictEqual(log.args.runTests[0][0], 'bar');
            });

            test('webpagetest.getResults was not called', function () {
                assert.strictEqual(log.counts.getResults, 0);
            });

            test('promise is unfulfilled', function () {
                assert.isFalse(resolved);
                assert.isFalse(rejected);
            });

            suite('resolve promises', function () {
                setup(function (d) {
                    done = d;
                    runTests.resolve('baz');
                    getResults.resolve('qux');
                });

                test('webpagetest.getResults was called once', function () {
                    assert.strictEqual(log.counts.getResults, 1);
                    assert.isNull(log.these.getResults[0]);
                });

                test('webpagetest.getResults was called correctly', function () {
                    assert.lengthOf(log.args.getResults[0], 2);
                    assert.strictEqual(log.args.getResults[0][0], 'bar');
                    assert.strictEqual(log.args.getResults[0][1], 'baz');
                });

                test('promise is resolved', function () {
                    assert.isTrue(resolved);
                    assert.isFalse(rejected);
                });

                test('result is correct', function () {
                    assert.isObject(result);
                    assert.lengthOf(Object.keys(result), 3);
                    assert.strictEqual(result.data, 'qux');
                    assert.strictEqual(result.options, 'bar');
                    assert.isObject(result.times);
                    assert.lengthOf(Object.keys(result.times), 2);
                    assert.instanceOf(result.times.begin, Date);
                    assert.instanceOf(result.times.end, Date);
                });

                test('bfj.write was not called', function () {
                    assert.strictEqual(log.counts.write, 0);
                });
            });
        });

        suite('fetch with dump:', function () {
            var runTests, getResults, resolved, rejected, result, error, done;

            setup(function () {
                runTests = {};
                getResults = {};

                results.normalise[0] = { dump: true, log: { info: nop, warn: nop, error: nop } };
                results.runTests[0] = new Promise(function (resolve, reject) {
                    runTests.resolve = resolve;
                    runTests.reject = reject;
                });
                results.getResults[0] = new Promise(function (resolve, reject) {
                    getResults.resolve = resolve;
                    getResults.reject = reject;
                });
                results.resolve[0] = 'wibble';
                results.write[0] = Promise.resolve();

                resolved = rejected = false;

                index.fetch('blah').then(function (r) {
                    resolved = true;
                    result = r;
                    if (done) {
                        done();
                    }
                }).catch(function (e) {
                    rejected = true;
                    error = e;
                    if (done) {
                        done();
                    }
                });
            });

            teardown(function () {
                resolved = rejected = result = error = done = undefined;
            });

            test('options.normalise was called once', function () {
                assert.strictEqual(log.counts.normalise, 1);
            });

            test('options.normalise was called correctly', function () {
                assert.strictEqual(log.args.normalise[0][0], 'blah');
            });

            test('webpagetest.runTests was called once', function () {
                assert.strictEqual(log.counts.runTests, 1);
            });

            test('webpagetest.runTests was called correctly', function () {
                assert.isObject(log.args.runTests[0][0]);
                assert.lengthOf(Object.keys(log.args.runTests[0][0]), 2);
                assert.strictEqual(log.args.runTests[0][0].dump, true);
                assert.isObject(log.args.runTests[0][0].log);
                assert.lengthOf(Object.keys(log.args.runTests[0][0].log), 3);
                assert.isFunction(log.args.runTests[0][0].log.info);
                assert.isFunction(log.args.runTests[0][0].log.warn);
                assert.isFunction(log.args.runTests[0][0].log.error);
            });

            test('webpagetest.getResults was not called', function () {
                assert.strictEqual(log.counts.getResults, 0);
            });

            test('promise is unfulfilled', function () {
                assert.isFalse(resolved);
                assert.isFalse(rejected);
            });

            suite('resolve promises', function () {
                setup(function (d) {
                    done = d;
                    runTests.resolve('foo');
                    getResults.resolve({ foo: 'bar' });
                });

                test('webpagetest.getResults was called once', function () {
                    assert.strictEqual(log.counts.getResults, 1);
                });

                test('webpagetest.getResults was called correctly', function () {
                    assert.isObject(log.args.getResults[0][0]);
                    assert.lengthOf(Object.keys(log.args.getResults[0]), 2);
                    assert.strictEqual(log.args.getResults[0][0].dump, true);
                    assert.isObject(log.args.getResults[0][0].log);
                    assert.lengthOf(Object.keys(log.args.getResults[0][0].log), 3);
                    assert.isFunction(log.args.getResults[0][0].log.info);
                    assert.isFunction(log.args.getResults[0][0].log.warn);
                    assert.isFunction(log.args.getResults[0][0].log.error);
                    assert.notStrictEqual(log.args.getResults[0], log.args.runTests[0]);
                    assert.strictEqual(log.args.getResults[0][1], 'foo');
                });

                test('promise is resolved', function () {
                    assert.isTrue(resolved);
                    assert.isFalse(rejected);
                });

                test('result is correct', function () {
                    assert.isObject(result);
                    assert.lengthOf(Object.keys(result), 3);
                    assert.isObject(result.data);
                    assert.lengthOf(Object.keys(result.data), 1);
                    assert.strictEqual(result.data.foo, 'bar');
                    assert.isObject(result.options);
                    assert.lengthOf(Object.keys(result.options), 2);
                    assert.strictEqual(result.options.dump, true);
                    assert.isObject(result.options.log);
                    assert.lengthOf(Object.keys(result.options.log), 3);
                    assert.isFunction(result.options.log.info);
                    assert.isFunction(result.options.log.warn);
                    assert.isFunction(result.options.log.error);
                    assert.notStrictEqual(result.options, log.args.getResults[0]);
                    assert.isObject(result.times);
                    assert.lengthOf(Object.keys(result.times), 2);
                    assert.instanceOf(result.times.begin, Date);
                    assert.instanceOf(result.times.end, Date);
                });

                test('bfj.write was called once', function () {
                    assert.strictEqual(log.counts.write, 1);
                    assert.strictEqual(log.these.write[0], require('bfj'));
                });

                test('bfj.write was called correctly', function () {
                    assert.lengthOf(log.args.write[0], 3);
                    assert.strictEqual(log.args.write[0][0], 'wibble');
                    assert.strictEqual(log.args.write[0][1], result);
                    assert.isObject(log.args.write[0][2]);
                    assert.lengthOf(Object.keys(log.args.write[0][2]), 2);
                    assert.strictEqual(log.args.write[0][2].encoding, 'utf8');
                    assert.strictEqual(log.args.write[0][2].mode, 420);
                });
            });
        });
    });

    function nop () {};
});

