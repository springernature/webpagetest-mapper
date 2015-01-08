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
require('es6-promise').polyfill();

modulePath = '../src/webpagetest';

mockery.registerAllowable(modulePath);

suite('webpagetest:', function () {
    var log;

    setup(function () {
        log = {};

        mockery.enable({ useCleanCache: true });
        mockery.registerMock('webpagetest', spooks.ctor({
            name: 'webpagetest',
            archetype: { instance: { runTest: nop, getTestResults: nop } },
            log: log,
        }));
    });

    teardown(function () {
        mockery.deregisterMock('webpagetest');
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

    suite('require:', function () {
        var webpagetest;

        setup(function () {
            webpagetest = require(modulePath);
        });

        teardown(function () {
            webpagetest = undefined;
        });

        test('runTests function is exported', function () {
            assert.isFunction(webpagetest.runTests);
        });

        test('runTests throws with empty options', function () {
            assert.throws(function () {
                webpagetest.runTests({});
            });
        });

        test('runTests does not throw with valid options', function () {
            assert.doesNotThrow(function () {
                webpagetest.runTests({
                    log: { info: nop, warn: nop, error: nop },
                    tests: []
                });
            });
        });

        test('getResults function is exported', function () {
            assert.isFunction(webpagetest.getResults);
        });

        test('getResults throws with empty options', function () {
            assert.throws(function () {
                webpagetest.getResults({});
            });
        });

        test('getResults does not throw with valid options', function () {
            assert.doesNotThrow(function () {
                webpagetest.getResults({
                    log: { info: nop, warn: nop, error: nop }
                }, []);
            });
        });
    });

    function nop () {};
});

