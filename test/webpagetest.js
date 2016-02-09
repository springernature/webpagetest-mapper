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

        test('runTests returns a promise', function () {
            assert.instanceOf(webpagetest.runTests({
                log: { info: nop, warn: nop, error: nop },
                tests: []
            }), Promise);
        });

        test('webpagetest-api constructor was not called', function () {
            assert.strictEqual(log.counts.webpagetest, 0);
        });

        test('webpagetest-api.runTest was not called', function () {
            assert.strictEqual(log.counts.runTest, 0);
        });

        suite('runTests with all options:', function () {
            var resolved, rejected, result, error, done;

            setup(function () {
                resolved = rejected = false;
                webpagetest.runTests({
                    uri: 'test base URI',
                    key: 'test key',
                    location: 'test location',
                    count: 'test count',
                    connection: 'test connection',
                    email: 'test email',
                    log: { info: nop, warn: nop, error: nop },
                    tests: [
                        { name: 'Foo', url: 'bar', type: 'home' },
                        { name: 'BAZ', url: 'qux', type: 'away' }
                    ]
                }).then(function (r) {
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

            test('webpagetest-api constructor was called once', function () {
                assert.strictEqual(log.counts.webpagetest, 1);
            });

            test('webpagetest-api constructor was called correctly', function () {
                assert.lengthOf(log.args.webpagetest[0], 1);
                assert.strictEqual(log.args.webpagetest[0][0], 'test base URI');
            });

            test('webpagetest-api.runTest was called twice', function () {
                assert.strictEqual(log.counts.runTest, 2);
            });

            test('webpagetest-api.runTest was called correctly first time', function () {
                assert.lengthOf(log.args.runTest[0], 3);
                assert.strictEqual(log.args.runTest[0][0], 'bar');
                assert.isObject(log.args.runTest[0][1]);
                assert.lengthOf(Object.keys(log.args.runTest[0][1]), 37);
                assert.strictEqual(log.args.runTest[0][1].name, 'Foo');
                assert.strictEqual(log.args.runTest[0][1].type, 'home');
                assert.strictEqual(log.args.runTest[0][1].url, log.args.runTest[0][0]);
                assert.strictEqual(log.args.runTest[0][1].key, 'test key');
                assert.strictEqual(log.args.runTest[0][1].location, 'test location');
                assert.strictEqual(log.args.runTest[0][1].runs, 'test count');
                assert.strictEqual(log.args.runTest[0][1].connectivity, 'test connection');
                assert.strictEqual(log.args.runTest[0][1].notifyEmail, 'test email');
                assert.match(log.args.runTest[0][1].label, /^[0-9]{8}-[0-9]{6}-01-foo$/);
                assert.isTrue(log.args.runTest[0][1].video);
                assert.isTrue(log.args.runTest[0][1].saveResponseBodies);
                assert.isTrue(log.args.runTest[0][1].aftRenderingTime);
                assert.isTrue(log.args.runTest[0][1].medianVideo);
                assert.isFalse(log.args.runTest[0][1].firstViewOnly);
                assert.isFalse(log.args.runTest[0][1].private);
                assert.isFalse(log.args.runTest[0][1].stopAtDocumentComplete);
                assert.isFalse(log.args.runTest[0][1].tcpDump);
                assert.isFalse(log.args.runTest[0][1].fullResolutionScreenshot);
                assert.isFalse(log.args.runTest[0][1].ignoreSSL);
                assert.isFalse(log.args.runTest[0][1].keepOriginalUserAgent);
                assert.isFalse(log.args.runTest[0][1].blockAds);
                assert.isFalse(log.args.runTest[0][1].htmlBody);
                assert.isFalse(log.args.runTest[0][1].continuous);
                assert.isFalse(log.args.runTest[0][1].clearCerts);
                assert.isFalse(log.args.runTest[0][1].emulateMobile);
                assert.isFalse(log.args.runTest[0][1].timeline);
                assert.isFalse(log.args.runTest[0][1].netLog);
                assert.isFalse(log.args.runTest[0][1].forceSoftwareRendering);
                assert.isFalse(log.args.runTest[0][1].forceSpdy3);
                assert.isFalse(log.args.runTest[0][1].spdyNoSSL);
                assert.isFalse(log.args.runTest[0][1].disableOptimization);
                assert.isFalse(log.args.runTest[0][1].disableScreenshot);
                assert.isFalse(log.args.runTest[0][1].disableHTTPHeaders);
                assert.isFalse(log.args.runTest[0][1].disableJavaScript);
                assert.isFalse(log.args.runTest[0][1].disableThreadedParser);
                assert.strictEqual(log.args.runTest[0][1].jpegQuality, 85);
                assert.strictEqual(log.args.runTest[0][1].pollResults, 30);
                assert.isFunction(log.args.runTest[0][2]);
            });

            test('webpagetest-api.runTest was called correctly second time', function () {
                assert.lengthOf(log.args.runTest[1], 3);
                assert.strictEqual(log.args.runTest[1][0], 'qux');
                assert.strictEqual(log.args.runTest[1][1].name, 'BAZ');
                assert.strictEqual(log.args.runTest[1][1].type, 'away');
                assert.strictEqual(log.args.runTest[1][1].url, log.args.runTest[1][0]);
                assert.strictEqual(log.args.runTest[1][1].key, 'test key');
                assert.strictEqual(log.args.runTest[1][1].location, 'test location');
                assert.strictEqual(log.args.runTest[1][1].runs, 'test count');
                assert.strictEqual(log.args.runTest[1][1].connectivity, 'test connection');
                assert.strictEqual(log.args.runTest[1][1].notifyEmail, 'test email');
                assert.match(log.args.runTest[1][1].label, /^[0-9]{8}-[0-9]{6}-02-baz$/);
                assert.isFunction(log.args.runTest[1][2]);
                assert.notStrictEqual(log.args.runTest[0][2], log.args.runTest[1][2]);
                assert.strictEqual(log.these.runTest[0], log.these.runTest[1]);
            });

            test('promise is unfulfilled', function () {
                assert.isFalse(resolved);
                assert.isFalse(rejected);
            });

            suite('first callback successful:', function () {
                setup(function () {
                    log.args.runTest[0][2](undefined, { data: { id: 'first result' } });
                });

                test('promise is unfulfilled', function () {
                    assert.isFalse(resolved);
                    assert.isFalse(rejected);
                });

                suite('second callback successful:', function () {
                    setup(function (d) {
                        log.args.runTest[1][2](undefined, { data: { id: 'second result' } });
                        done = d;
                    });

                    test('promise is resolved', function () {
                        assert.isTrue(resolved);
                        assert.isFalse(rejected);
                    });

                    test('result is correct', function () {
                        assert.isArray(result);
                        assert.lengthOf(result, 2);

                        assert.isObject(result[0]);
                        assert.lengthOf(Object.keys(result[0]), 5);
                        assert.strictEqual(result[0].name, log.args.runTest[0][1].name);
                        assert.strictEqual(result[0].type, log.args.runTest[0][1].type);
                        assert.strictEqual(result[0].url, log.args.runTest[0][1].url);
                        assert.strictEqual(result[0].label, log.args.runTest[0][1].label);
                        assert.strictEqual(result[0].id, 'first result');
                        assert.isUndefined(result[0].error);

                        assert.isObject(result[1]);
                        assert.strictEqual(result[1].name, log.args.runTest[1][1].name);
                        assert.strictEqual(result[1].type, log.args.runTest[1][1].type);
                        assert.strictEqual(result[1].url, log.args.runTest[1][1].url);
                        assert.strictEqual(result[1].label, log.args.runTest[1][1].label);
                        assert.strictEqual(result[1].id, 'second result');
                        assert.isUndefined(result[0].error);
                    });
                });

                suite('second callback fails:', function () {
                    setup(function (d) {
                        log.args.runTest[1][2]('an error message');
                        done = d;
                    });

                    test('promise is resolved', function () {
                        assert.isTrue(resolved);
                        assert.isFalse(rejected);
                    });

                    test('result is correct', function () {
                        assert.isArray(result);
                        assert.lengthOf(result, 2);

                        assert.isObject(result[0]);
                        assert.lengthOf(Object.keys(result[0]), 5);

                        assert.isObject(result[1]);
                        assert.lengthOf(Object.keys(result[1]), 5);
                        assert.strictEqual(result[1].name, log.args.runTest[1][1].name);
                        assert.strictEqual(result[1].type, log.args.runTest[1][1].type);
                        assert.strictEqual(result[1].url, log.args.runTest[1][1].url);
                        assert.strictEqual(result[1].label, log.args.runTest[1][1].label);
                        assert.isUndefined(result[1].id);
                        assert.strictEqual(result[1].error, 'an error message');
                    });
                });
            });

            suite('second callback successful:', function () {
                setup(function () {
                    log.args.runTest[1][2](undefined, { data: { id: 'foo' } });
                });

                test('promise is unfulfilled', function () {
                    assert.isFalse(resolved);
                    assert.isFalse(rejected);
                });

                suite('first callback successful:', function () {
                    setup(function (d) {
                        log.args.runTest[0][2](undefined, { data: { id: 'bar' } });
                        done = d;
                    });

                    test('promise is resolved', function () {
                        assert.isTrue(resolved);
                        assert.isFalse(rejected);
                    });

                    test('result is correct', function () {
                        assert.isArray(result);
                        assert.lengthOf(result, 2);

                        assert.isObject(result[0]);
                        assert.strictEqual(result[0].id, 'bar');
                        assert.isUndefined(result[0].error);

                        assert.isObject(result[1]);
                        assert.strictEqual(result[1].id, 'foo');
                        assert.isUndefined(result[0].error);
                    });
                });

                suite('first callback fails:', function () {
                    setup(function (d) {
                        log.args.runTest[0][2]('a different error message');
                        done = d;
                    });

                    test('promise is resolved', function () {
                        assert.isTrue(resolved);
                        assert.isFalse(rejected);
                    });

                    test('result is correct', function () {
                        assert.isUndefined(result[0].id);
                        assert.strictEqual(result[0].error, 'a different error message');
                    });
                });
            });

            suite('first callback fails:', function () {
                setup(function () {
                    log.args.runTest[0][2]('wibble');
                });

                test('promise is unfulfilled', function () {
                    assert.isFalse(resolved);
                    assert.isFalse(rejected);
                });

                suite('second callback fails:', function () {
                    setup(function (d) {
                        log.args.runTest[1][2]('wobble');
                        done = d;
                    });

                    test('promise is resolved', function () {
                        assert.isTrue(resolved);
                        assert.isFalse(rejected);
                    });

                    test('result is correct', function () {
                        assert.isUndefined(result[0].id);
                        assert.strictEqual(result[0].error, 'wibble');
                        assert.isUndefined(result[0].id);
                        assert.strictEqual(result[1].error, 'wobble');
                    });
                });
            });
        });

        suite('runTests with minimal options:', function () {
            var resolved, rejected, result, error, done;

            setup(function () {
                resolved = rejected = false;
                webpagetest.runTests({
                    log: { info: nop, warn: nop, error: nop },
                    tests: [
                        { name: 'a', url: 'b', type: 'home' }
                    ]
                }).then(function (r) {
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

            test('webpagetest-api.runTest was called once', function () {
                assert.strictEqual(log.counts.runTest, 1);
            });

            test('webpagetest-api.runTest was called correctly', function () {
                assert.strictEqual(log.args.runTest[0][0], 'b');
                assert.strictEqual(log.args.runTest[0][1].name, 'a');
                assert.strictEqual(log.args.runTest[0][1].type, 'home');
                assert.strictEqual(log.args.runTest[0][1].url, log.args.runTest[0][0]);
                assert.isUndefined(log.args.runTest[0][1].key);
                assert.isUndefined(log.args.runTest[0][1].location);
                assert.isUndefined(log.args.runTest[0][1].runs);
                assert.isUndefined(log.args.runTest[0][1].connectivity);
                assert.isUndefined(log.args.runTest[0][1].notifyEmail);
                assert.match(log.args.runTest[0][1].label, /^[0-9]{8}-[0-9]{6}-01-a$/);
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

        test('webpagetest-api.getTestResults was not called', function () {
            assert.strictEqual(log.counts.getTestResults, 0);
        });

        suite('getResults:', function () {
            var resolved, rejected, result, error, done;

            setup(function () {
                resolved = rejected = false;
                webpagetest.getResults({
                    uri: 'foo',
                    key: 'bar',
                    log: { info: nop, warn: nop, error: nop }
                }, [
                    { name: 'a', url: 'b', type: 'away', label: 'c', id: 'd' },
                    { name: 'e', url: 'f', type: 'home', label: 'g', id: 'h' }
                ]).then(function (r) {
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

            test('webpagetest-api constructor was called once', function () {
                assert.strictEqual(log.counts.webpagetest, 1);
            });

            test('webpagetest-api constructor was called correctly', function () {
                assert.lengthOf(log.args.webpagetest[0], 1);
                assert.strictEqual(log.args.webpagetest[0][0], 'foo');
            });

            test('webpagetest-api.getTestResults was called eight times', function () {
                assert.strictEqual(log.counts.getTestResults, 8);
            });

            test('webpagetest-api.getTestResults was called correctly first time', function () {
                assert.lengthOf(log.args.getTestResults[0], 3);
                assert.strictEqual(log.args.getTestResults[0][0], 'd');
                assert.isObject(log.args.getTestResults[0][1]);
                assert.lengthOf(Object.keys(log.args.getTestResults[0][1]), 6);
                assert.strictEqual(log.args.getTestResults[0][1].key, 'bar');
                assert.strictEqual(log.args.getTestResults[0][1].medianMetric, 'SpeedIndex');
                assert.isFalse(log.args.getTestResults[0][1].breakDown);
                assert.isFalse(log.args.getTestResults[0][1].domains);
                assert.isFalse(log.args.getTestResults[0][1].pageSpeed);
                assert.isFalse(log.args.getTestResults[0][1].requests);
                assert.isFunction(log.args.getTestResults[0][2]);
            });

            test('webpagetest-api.getTestResults was called correctly second time', function () {
                assert.lengthOf(log.args.getTestResults[1], 3);
                assert.strictEqual(log.args.getTestResults[1][0], 'd');
                assert.strictEqual(log.args.getTestResults[1][1].key, 'bar');
                assert.strictEqual(log.args.getTestResults[1][1].medianMetric, 'TTFB');
                assert.isFunction(log.args.getTestResults[1][2]);
                assert.notStrictEqual(log.args.getTestResults[0][2], log.args.getTestResults[1][2]);
                assert.strictEqual(log.these.getTestResults[0], log.these.getTestResults[1]);
            });

            test('webpagetest-api.getTestResults was called correctly third time', function () {
                assert.strictEqual(log.args.getTestResults[2][0], 'd');
                assert.strictEqual(log.args.getTestResults[2][1].medianMetric, 'render');
                assert.notStrictEqual(log.args.getTestResults[0][2], log.args.getTestResults[1][2]);
                assert.notStrictEqual(log.args.getTestResults[0][2], log.args.getTestResults[2][2]);
            });

            test('webpagetest-api.getTestResults was called correctly fourth time', function () {
                assert.strictEqual(log.args.getTestResults[3][0], 'd');
                assert.strictEqual(log.args.getTestResults[3][1].medianMetric, 'loadTime');
            });

            test('webpagetest-api.getTestResults was called correctly fifth time', function () {
                assert.strictEqual(log.args.getTestResults[4][0], 'h');
                assert.strictEqual(log.args.getTestResults[4][1].medianMetric, 'SpeedIndex');
            });

            test('webpagetest-api.getTestResults was called correctly sixth time', function () {
                assert.strictEqual(log.args.getTestResults[5][0], 'h');
                assert.strictEqual(log.args.getTestResults[5][1].medianMetric, 'TTFB');
            });

            test('webpagetest-api.getTestResults was called correctly seventh time', function () {
                assert.strictEqual(log.args.getTestResults[6][0], 'h');
                assert.strictEqual(log.args.getTestResults[6][1].medianMetric, 'render');
            });

            test('webpagetest-api.getTestResults was called correctly eighth time', function () {
                assert.strictEqual(log.args.getTestResults[7][0], 'h');
                assert.strictEqual(log.args.getTestResults[7][1].medianMetric, 'loadTime');
            });

            test('promise is unfulfilled', function () {
                assert.isFalse(resolved);
                assert.isFalse(rejected);
            });

            suite('first callback successful:', function () {
                setup(function () {
                    log.args.getTestResults[0][2](undefined, { data: { runs: {}, median: {} }, statusCode: 200 });
                });

                test('promise is unfulfilled', function () {
                    assert.isFalse(resolved);
                    assert.isFalse(rejected);
                });

                suite('second callback successful:', function () {
                    setup(function () {
                        log.args.getTestResults[1][2](undefined, { data: { runs: {}, median: {} }, statusCode: 200 });
                    });

                    test('promise is unfulfilled', function () {
                        assert.isFalse(resolved);
                        assert.isFalse(rejected);
                    });

                    suite('third callback successful:', function () {
                        setup(function () {
                            log.args.getTestResults[2][2](undefined, { data: { runs: {}, median: {} }, statusCode: 200 });
                        });

                        test('promise is unfulfilled', function () {
                            assert.isFalse(resolved);
                            assert.isFalse(rejected);
                        });

                        suite('fourth callback successful:', function () {
                            setup(function () {
                                log.args.getTestResults[3][2](undefined, { data: { runs: {}, median: {} }, statusCode: 200 });
                            });

                            test('promise is unfulfilled', function () {
                                assert.isFalse(resolved);
                                assert.isFalse(rejected);
                            });

                            suite('fifth callback successful:', function () {
                                setup(function () {
                                    log.args.getTestResults[4][2](undefined, { data: { runs: {}, median: {} }, statusCode: 200 });
                                });

                                test('promise is unfulfilled', function () {
                                    assert.isFalse(resolved);
                                    assert.isFalse(rejected);
                                });

                                suite('sixth callback successful:', function () {
                                    setup(function () {
                                        log.args.getTestResults[5][2](undefined, { data: { runs: {}, median: {} }, statusCode: 200 });
                                    });

                                    test('promise is unfulfilled', function () {
                                        assert.isFalse(resolved);
                                        assert.isFalse(rejected);
                                    });

                                    suite('seventh callback successful:', function () {
                                        setup(function () {
                                            log.args.getTestResults[6][2](undefined, { data: { runs: {}, median: {} }, statusCode: 200 });
                                        });

                                        test('promise is unfulfilled', function () {
                                            assert.isFalse(resolved);
                                            assert.isFalse(rejected);
                                        });

                                        suite('eighth callback successful:', function () {
                                            setup(function (d) {
                                                log.args.getTestResults[7][2](undefined, { data: { runs: {}, median: {} }, statusCode: 200 });
                                                done = d;
                                            });

                                            test('promise is resolved', function () {
                                                assert.isTrue(resolved);
                                                assert.isFalse(rejected);
                                            });

                                            test('result is correct', function () {
                                                assert.isArray(result);
                                                assert.lengthOf(result, 2);

                                                assert.isObject(result[0]);
                                                assert.lengthOf(Object.keys(result[0]), 9);
                                                assert.strictEqual(result[0].name, 'a');
                                                assert.strictEqual(result[0].url, 'b');
                                                assert.strictEqual(result[0].type, 'away');
                                                assert.strictEqual(result[0].label, 'c');
                                                assert.strictEqual(result[0].id, 'd');
                                                assert.isObject(result[0].SpeedIndex);
                                                assert.lengthOf(Object.keys(result[0].SpeedIndex), 1);
                                                assert.isObject(result[0].TTFB);
                                                assert.lengthOf(Object.keys(result[0].TTFB), 1);
                                                assert.isObject(result[0].render);
                                                assert.lengthOf(Object.keys(result[0].render), 1);
                                                assert.isObject(result[0].loadTime);
                                                assert.lengthOf(Object.keys(result[0].loadTime), 1);

                                                assert.isObject(result[1]);
                                                assert.lengthOf(Object.keys(result[1]), 9);
                                                assert.strictEqual(result[1].name, 'e');
                                                assert.strictEqual(result[1].url, 'f');
                                                assert.strictEqual(result[1].type, 'home');
                                                assert.strictEqual(result[1].label, 'g');
                                                assert.strictEqual(result[1].id, 'h');
                                                assert.isObject(result[1].SpeedIndex);
                                                assert.lengthOf(Object.keys(result[1].SpeedIndex), 1);
                                                assert.isObject(result[1].TTFB);
                                                assert.lengthOf(Object.keys(result[1].TTFB), 1);
                                                assert.isObject(result[1].render);
                                                assert.lengthOf(Object.keys(result[1].render), 1);
                                                assert.isObject(result[1].loadTime);
                                                assert.lengthOf(Object.keys(result[1].loadTime), 1);
                                            });
                                        });

                                        suite('eighth callback fails:', function () {
                                            setup(function (d) {
                                                log.args.getTestResults[7][2]('foo', { data: { runs: {}, median: {} }, statusCode: 200 });
                                                done = d;
                                            });

                                            test('promise is resolved', function () {
                                                assert.isTrue(resolved);
                                                assert.isFalse(rejected);
                                            });

                                            test('result is correct', function () {
                                                assert.isArray(result);
                                                assert.lengthOf(result, 2);

                                                assert.isObject(result[0]);
                                                assert.lengthOf(Object.keys(result[0]), 9);
                                                assert.strictEqual(result[0].name, 'a');
                                                assert.strictEqual(result[0].url, 'b');
                                                assert.strictEqual(result[0].type, 'away');
                                                assert.strictEqual(result[0].label, 'c');
                                                assert.strictEqual(result[0].id, 'd');
                                                assert.isObject(result[0].SpeedIndex);
                                                assert.lengthOf(Object.keys(result[0].SpeedIndex), 1);
                                                assert.isObject(result[0].TTFB);
                                                assert.lengthOf(Object.keys(result[0].TTFB), 1);
                                                assert.isObject(result[0].render);
                                                assert.lengthOf(Object.keys(result[0].render), 1);
                                                assert.isObject(result[0].loadTime);
                                                assert.lengthOf(Object.keys(result[0].loadTime), 1);

                                                assert.isObject(result[1]);
                                                assert.lengthOf(Object.keys(result[1]), 8);
                                                assert.strictEqual(result[1].name, 'e');
                                                assert.strictEqual(result[1].url, 'f');
                                                assert.strictEqual(result[1].type, 'home');
                                                assert.strictEqual(result[1].label, 'g');
                                                assert.strictEqual(result[1].id, 'h');
                                                assert.isObject(result[1].SpeedIndex);
                                                assert.lengthOf(Object.keys(result[1].SpeedIndex), 1);
                                                assert.isObject(result[1].TTFB);
                                                assert.lengthOf(Object.keys(result[1].TTFB), 1);
                                                assert.isObject(result[1].render);
                                                assert.lengthOf(Object.keys(result[1].render), 1);
                                                assert.isUndefined(result[1].loadTime);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });

            suite('first callback fails:', function () {
                setup(function () {
                    log.args.getTestResults[0][2]('wibble', { data: { runs: {}, median: {} }, statusCode: 200 });
                });

                test('promise is unfulfilled', function () {
                    assert.isFalse(resolved);
                    assert.isFalse(rejected);
                });

                suite('second callback successful:', function () {
                    setup(function () {
                        log.args.getTestResults[1][2](undefined, { data: { runs: {}, median: {} }, statusCode: 200 });
                    });

                    test('promise is unfulfilled', function () {
                        assert.isFalse(resolved);
                        assert.isFalse(rejected);
                    });

                    suite('third callback successful:', function () {
                        setup(function () {
                            log.args.getTestResults[2][2](undefined, { data: { runs: {}, median: {} }, statusCode: 200 });
                        });

                        test('promise is unfulfilled', function () {
                            assert.isFalse(resolved);
                            assert.isFalse(rejected);
                        });

                        suite('fourth callback successful:', function () {
                            setup(function () {
                                log.args.getTestResults[3][2](undefined, { data: { runs: {}, median: {} }, statusCode: 200 });
                            });

                            test('promise is unfulfilled', function () {
                                assert.isFalse(resolved);
                                assert.isFalse(rejected);
                            });

                            suite('fifth callback successful:', function () {
                                setup(function () {
                                    log.args.getTestResults[4][2](undefined, { data: { runs: {}, median: {} }, statusCode: 200 });
                                });

                                test('promise is unfulfilled', function () {
                                    assert.isFalse(resolved);
                                    assert.isFalse(rejected);
                                });

                                suite('sixth callback successful:', function () {
                                    setup(function () {
                                        log.args.getTestResults[5][2](undefined, { data: { runs: {}, median: {} }, statusCode: 200 });
                                    });

                                    test('promise is unfulfilled', function () {
                                        assert.isFalse(resolved);
                                        assert.isFalse(rejected);
                                    });

                                    suite('seventh callback successful:', function () {
                                        setup(function () {
                                            log.args.getTestResults[6][2](undefined, { data: { runs: {}, median: {} }, statusCode: 200 });
                                        });

                                        test('promise is unfulfilled', function () {
                                            assert.isFalse(resolved);
                                            assert.isFalse(rejected);
                                        });

                                        suite('eighth callback successful:', function () {
                                            setup(function (d) {
                                                log.args.getTestResults[7][2](undefined, { data: { runs: {}, median: {} }, statusCode: 200 });
                                                done = d;
                                            });

                                            test('promise is resolved', function () {
                                                assert.isTrue(resolved);
                                                assert.isFalse(rejected);
                                            });

                                            test('result is correct', function () {
                                                assert.lengthOf(result, 2);

                                                assert.lengthOf(Object.keys(result[0]), 8);
                                                assert.isUndefined(result[0].SpeedIndex);

                                                assert.lengthOf(Object.keys(result[1]), 9);
                                            });
                                        });

                                        suite('eighth callback fails:', function () {
                                            setup(function (d) {
                                                log.args.getTestResults[7][2]('foo', { data: { runs: {}, median: {} }, statusCode: 200 });
                                                done = d;
                                            });

                                            test('promise is resolved', function () {
                                                assert.isTrue(resolved);
                                                assert.isFalse(rejected);
                                            });

                                            test('result is correct', function () {
                                                assert.lengthOf(result, 2);

                                                assert.lengthOf(Object.keys(result[0]), 8);

                                                assert.lengthOf(Object.keys(result[1]), 8);
                                                assert.isUndefined(result[1].loadTime);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    function nop () {};
});

