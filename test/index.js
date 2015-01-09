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

'use strict';

var assert, mockery, spooks, modulePath;

assert = require('chai').assert;
mockery = require('mockery');
spooks = require('spooks');

modulePath = '../src/index';

mockery.registerAllowable(modulePath);
mockery.registerAllowable('es6-promise');

suite('index:', function () {
    var log;

    setup(function () {
        log = {};

        mockery.enable({ useCleanCache: true });
        mockery.registerMock('fs', spooks.obj({
            archetype: { writeFileSync: nop },
            log: log,
        }));
        mockery.registerMock('path', spooks.obj({
            archetype: { resolve: nop },
            log: log,
        }));
        mockery.registerMock('./options', spooks.obj({
            archetype: {
                normalise: nop,
                get: spooks.obj({
                    archetype: { results: nop, log: nop, mapper: nop },
                    log: log
                })
            },
            log: log,
        }));
        mockery.registerMock('./webpagetest', spooks.obj({
            archetype: { runTests: nop, fetch: nop },
            log: log,
        }));
    });

    teardown(function () {
        mockery.deregisterMock('./webpagetest');
        mockery.deregisterMock('./options');
        mockery.deregisterMock('path');
        mockery.deregisterMock('fs');
        mockery.disable();

        log = undefined;
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
            var resolved, rejected, result, error, done;

            setup(function () {
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
        });
    });

    function nop () {};
});

