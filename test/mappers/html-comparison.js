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

modulePath = '../../src/mappers/html-comparison';

mockery.registerAllowable(modulePath);
mockery.registerAllowable('check-types');
mockery.registerAllowable('../../../package.json');

suite('mappers/html-comparison:', function () {
    var log, results;

    setup(function () {
        log = {};
        results = {
            join: [],
            compile: []
        };

        mockery.enable({ useCleanCache: true });
        mockery.registerMock('path', spooks.obj({
            archetype: { join: nop },
            log: log,
            results: results
        }));
        mockery.registerMock('../../templates', spooks.obj({
            archetype: { compile: nop },
            log: log,
            results: results
        }));
    });

    teardown(function () {
        mockery.deregisterMock('path');
        mockery.deregisterMock('../../templates');
        mockery.disable();

        log = results = undefined;
    });

    test('require does not throw', function () {
        assert.doesNotThrow(function () {
            require(modulePath);
        });
    });

    test('path.join was not called', function () {
        assert.strictEqual(log.counts.join, 0);
    });

    test('templates.compile was not called', function () {
        assert.strictEqual(log.counts.compile, 0);
    });

    suite('require:', function () {
        var mapper;

        setup(function () {
            results.join[0] = 'foo';
            results.compile[0] = spooks.fn({
                name: 'render',
                log: log,
                results: [ 'bar' ]
            });
            mapper = require(modulePath);
        });

        teardown(function () {
            mapper = undefined;
        });

        test('object was returned', function () {
            assert.isObject(mapper);
        });

        test('one property is exported', function () {
            assert.lengthOf(Object.keys(mapper), 1);
        });

        test('map function is exported', function () {
            assert.isFunction(mapper.map);
        });

        test('map throws with bad location', function () {
            assert.throws(function () {
                mapper.map({
                    location: ''
                }, {
                    data: [],
                    times: { begin: new Date(), end: new Date() }
                });
            });
        });

        test('map throws with bad data', function () {
            assert.throws(function () {
                mapper.map({
                    location: 'wibble'
                }, {
                    data: {},
                    times: { begin: new Date(), end: new Date() }
                });
            });
        });

        test('map throws with bad times', function () {
            assert.throws(function () {
                mapper.map({
                    location: 'wibble'
                }, {
                    data: [],
                    times: { begin: '', end: '' }
                });
            });
        });

        test('compile does not throw with good arguments', function () {
            assert.doesNotThrow(function () {
                mapper.map({
                    location: 'wibble'
                }, {
                    data: [],
                    times: { begin: new Date(), end: new Date() }
                });
            });
        });

        test('path.join was called once', function () {
            assert.strictEqual(log.counts.join, 1);
            assert.strictEqual(log.these.join[0], require('path'));
        });

        test('path.join was called correctly', function () {
            assert.lengthOf(log.args.join[0], 2);
            assert.match(log.args.join[0][0], /\/src\/mappers\/html-comparison$/);
            assert.strictEqual(log.args.join[0][1], 'template.html');
        });

        test('templates.compile was called once', function () {
            assert.strictEqual(log.counts.compile, 1);
            assert.strictEqual(log.these.compile[0], require('../../templates'));
        });

        test('templates.compile was called correctly', function () {
            assert.lengthOf(log.args.compile[0], 1);
            assert.strictEqual(log.args.compile[0][0], 'foo');
        });

        test('render was not called', function () {
            assert.strictEqual(log.counts.render, 0);
        });

        suite('map:', function () {
            var result;

            setup(function () {
                result = mapper.map({
                    count: 25,
                    location: 'L3963:Firefox',
                    connection: 'Cable',
                    log: spooks.obj({
                        archetype: { info: nop, warn: nop, error: nop },
                        log: log
                    })
                }, {
                    data: [
                        {
                            id: 'first-id',
                            name: 'first name',
                            type: 'home',
                            url: 'first URL',
                            TTFB: {
                                data: {
                                    median: {
                                        firstView: {
                                            run: 0,
                                            TTFB: 1,
                                            render: 2,
                                            loadTime: 3,
                                            SpeedIndex: 4,
                                            bytesIn: 5,
                                            requests: 6,
                                            connections: 7,
                                            server_rtt: 8,
                                            score_gzip: 49,
                                            score_compress: 50,
                                            score_progressive_jpeg: 79,
                                            score_cache: 80,
                                            score_cdn: 100
                                        },
                                        repeatView: {
                                            run: 1,
                                            TTFB: 10,
                                            render: 9,
                                            loadTime: 8,
                                            SpeedIndex: 7,
                                            bytesIn: 6,
                                            requests: 5,
                                            connections: 4,
                                            server_rtt: 3,
                                            score_gzip: 99,
                                            score_compress: 80,
                                            score_progressive_jpeg: 79,
                                            score_cache: 50,
                                            score_cdn: 49
                                        }
                                    },
                                    runs: [
                                        {
                                            firstView: {
                                                pages: {
                                                    checklist: 'first TTFB first firstView checklist',
                                                    details: 'first TTFB first firstView details'
                                                }
                                            },
                                            repeatView: {
                                                pages: {
                                                    checklist: 'first TTFB first repeatView checklist',
                                                    details: 'first TTFB first repeatView details'
                                                }
                                            }
                                        },
                                        {
                                            firstView: {
                                                pages: {
                                                    checklist: 'first TTFB second firstView checklist',
                                                    details: 'first TTFB second firstView details'
                                                }
                                            },
                                            repeatView: {
                                                pages: {
                                                    checklist: 'first TTFB second repeatView checklist',
                                                    details: 'first TTFB second repeatView details'
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            render: {
                                data: {
                                    median: {
                                        firstView: {
                                            run: 0,
                                            TTFB: 10,
                                            render: 20,
                                            loadTime: 30,
                                            SpeedIndex: 40,
                                            bytesIn: 50,
                                            requests: 60,
                                            connections: 70,
                                            server_rtt: 80,
                                            score_gzip: 1,
                                            score_compress: 2,
                                            score_progressive_jpeg: 3,
                                            score_cache: 4,
                                            score_cdn: 5
                                        },
                                        repeatView: {
                                            run: 1,
                                            TTFB: 100,
                                            render: 90,
                                            loadTime: 80,
                                            SpeedIndex: 70,
                                            bytesIn: 60,
                                            requests: 50,
                                            connections: 40,
                                            server_rtt: 30,
                                            score_gzip: 6,
                                            score_compress: 7,
                                            score_progressive_jpeg: 8,
                                            score_cache: 9,
                                            score_cdn: 10
                                        }
                                    },
                                    runs: [
                                        {
                                            firstView: {
                                                pages: {
                                                    checklist: 'first render first firstView checklist',
                                                    details: 'first render first firstView details'
                                                }
                                            },
                                            repeatView: {
                                                pages: {
                                                    checklist: 'first render first repeatView checklist',
                                                    details: 'first render first repeatView details'
                                                }
                                            }
                                        },
                                        {
                                            firstView: {
                                                pages: {
                                                    checklist: 'first render second firstView checklist',
                                                    details: 'first render second firstView details'
                                                }
                                            },
                                            repeatView: {
                                                pages: {
                                                    checklist: 'first render second repeatView checklist',
                                                    details: 'first render second repeatView details'
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            loadTime: {
                                data: {
                                    median: {
                                        firstView: {
                                            run: 0,
                                            TTFB: 100,
                                            render: 200,
                                            loadTime: 300,
                                            SpeedIndex: 400,
                                            bytesIn: 500,
                                            requests: 600,
                                            connections: 700,
                                            server_rtt: 800,
                                            score_gzip: 49,
                                            score_compress: 50,
                                            score_progressive_jpeg: 79,
                                            score_cache: 80,
                                            score_cdn: 100
                                        },
                                        repeatView: {
                                            run: 1,
                                            TTFB: 1000,
                                            render: 900,
                                            loadTime: 800,
                                            SpeedIndex: 700,
                                            bytesIn: 600,
                                            requests: 500,
                                            connections: 400,
                                            server_rtt: 300,
                                            score_gzip: 99,
                                            score_compress: 80,
                                            score_progressive_jpeg: 79,
                                            score_cache: 50,
                                            score_cdn: 49
                                        }
                                    },
                                    runs: [
                                        {
                                            firstView: {
                                                pages: {
                                                    checklist: 'first loadTime first firstView checklist',
                                                    details: 'first loadTime first firstView details'
                                                }
                                            },
                                            repeatView: {
                                                pages: {
                                                    checklist: 'first loadTime first repeatView checklist',
                                                    details: 'first loadTime first repeatView details'
                                                }
                                            }
                                        },
                                        {
                                            firstView: {
                                                pages: {
                                                    checklist: 'first loadTime second firstView checklist',
                                                    details: 'first loadTime second firstView details'
                                                }
                                            },
                                            repeatView: {
                                                pages: {
                                                    checklist: 'first loadTime second repeatView checklist',
                                                    details: 'first loadTime second repeatView details'
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            SpeedIndex: {
                                data: {
                                    median: {
                                        firstView: {
                                            run: 0,
                                            TTFB: 10000,
                                            render: 20000,
                                            loadTime: 30000,
                                            SpeedIndex: 40000,
                                            bytesIn: 50000,
                                            requests: 60000,
                                            connections: 70000,
                                            server_rtt: 80000,
                                            score_gzip: 49,
                                            score_compress: 50,
                                            score_progressive_jpeg: 79,
                                            score_cache: 80,
                                            score_cdn: 100
                                        },
                                        repeatView: {
                                            run: 1,
                                            TTFB: 100000,
                                            render: 90000,
                                            loadTime: 80000,
                                            SpeedIndex: 70000,
                                            bytesIn: 60000,
                                            requests: 50000,
                                            connections: 40000,
                                            server_rtt: 30000,
                                            score_gzip: 99,
                                            score_compress: 80,
                                            score_progressive_jpeg: 79,
                                            score_cache: 50,
                                            score_cdn: 49
                                        }
                                    },
                                    runs: [
                                        {
                                            firstView: {
                                                pages: {
                                                    checklist: 'first SpeedIndex first firstView checklist',
                                                    details: 'first SpeedIndex first firstView details'
                                                }
                                            },
                                            repeatView: {
                                                pages: {
                                                    checklist: 'first SpeedIndex first repeatView checklist',
                                                    details: 'first SpeedIndex first repeatView details'
                                                }
                                            }
                                        },
                                        {
                                            firstView: {
                                                pages: {
                                                    checklist: 'first SpeedIndex second firstView checklist',
                                                    details: 'first SpeedIndex second firstView details'
                                                }
                                            },
                                            repeatView: {
                                                pages: {
                                                    checklist: 'first SpeedIndex second repeatView checklist',
                                                    details: 'first SpeedIndex second repeatView details'
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            id: 'the-second-id',
                            name: 'the second name',
                            type: 'home',
                            url: 'the second URL',
                            TTFB: {
                                data: {
                                    median: {
                                        firstView: {
                                            run: 0,
                                            TTFB: 1,
                                            render: 2,
                                            loadTime: 3,
                                            SpeedIndex: 4,
                                            bytesIn: 5,
                                            requests: 6,
                                            connections: 7,
                                            server_rtt: 8,
                                            score_gzip: 49,
                                            score_compress: 50,
                                            score_progressive_jpeg: 79,
                                            score_cache: 80,
                                            score_cdn: 100
                                        },
                                        repeatView: {
                                            run: 1,
                                            TTFB: 10,
                                            render: 9,
                                            loadTime: 8,
                                            SpeedIndex: 7,
                                            bytesIn: 6,
                                            requests: 5,
                                            connections: 4,
                                            server_rtt: 3,
                                            score_gzip: 99,
                                            score_compress: 80,
                                            score_progressive_jpeg: 79,
                                            score_cache: 50,
                                            score_cdn: 49
                                        }
                                    },
                                    runs: [
                                        {
                                            firstView: {
                                                pages: {
                                                    checklist: 'the second TTFB first firstView checklist',
                                                    details: 'the second TTFB first firstView details'
                                                }
                                            },
                                            repeatView: {
                                                pages: {
                                                    checklist: 'the second TTFB first repeatView checklist',
                                                    details: 'the second TTFB first repeatView details'
                                                }
                                            }
                                        },
                                        {
                                            firstView: {
                                                pages: {
                                                    checklist: 'the second TTFB second firstView checklist',
                                                    details: 'the second TTFB second firstView details'
                                                }
                                            },
                                            repeatView: {
                                                pages: {
                                                    checklist: 'the second TTFB second repeatView checklist',
                                                    details: 'the second TTFB second repeatView details'
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            render: {
                                data: {
                                    median: {
                                        firstView: {
                                            run: 0,
                                            TTFB: 10,
                                            render: 20,
                                            loadTime: 30,
                                            SpeedIndex: 40,
                                            bytesIn: 50,
                                            requests: 60,
                                            connections: 70,
                                            server_rtt: 80,
                                            score_gzip: 1,
                                            score_compress: 2,
                                            score_progressive_jpeg: 3,
                                            score_cache: 4,
                                            score_cdn: 5
                                        },
                                        repeatView: {
                                            run: 1,
                                            TTFB: 100,
                                            render: 90,
                                            loadTime: 80,
                                            SpeedIndex: 70,
                                            bytesIn: 60,
                                            requests: 50,
                                            connections: 40,
                                            server_rtt: 30,
                                            score_gzip: 6,
                                            score_compress: 7,
                                            score_progressive_jpeg: 8,
                                            score_cache: 9,
                                            score_cdn: 10
                                        }
                                    },
                                    runs: [
                                        {
                                            firstView: {
                                                pages: {
                                                    checklist: 'the second render first firstView checklist',
                                                    details: 'the second render first firstView details'
                                                }
                                            },
                                            repeatView: {
                                                pages: {
                                                    checklist: 'the second render first repeatView checklist',
                                                    details: 'the second render first repeatView details'
                                                }
                                            }
                                        },
                                        {
                                            firstView: {
                                                pages: {
                                                    checklist: 'the second render second firstView checklist',
                                                    details: 'the second render second firstView details'
                                                }
                                            },
                                            repeatView: {
                                                pages: {
                                                    checklist: 'the second render second repeatView checklist',
                                                    details: 'the second render second repeatView details'
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            loadTime: {
                                data: {
                                    median: {
                                        firstView: {
                                            run: 0,
                                            TTFB: 100,
                                            render: 200,
                                            loadTime: 300,
                                            SpeedIndex: 400,
                                            bytesIn: 500,
                                            requests: 600,
                                            connections: 700,
                                            server_rtt: 800,
                                            score_gzip: 49,
                                            score_compress: 50,
                                            score_progressive_jpeg: 79,
                                            score_cache: 80,
                                            score_cdn: 100
                                        },
                                        repeatView: {
                                            run: 1,
                                            TTFB: 1000,
                                            render: 900,
                                            loadTime: 800,
                                            SpeedIndex: 700,
                                            bytesIn: 600,
                                            requests: 500,
                                            connections: 400,
                                            server_rtt: 300,
                                            score_gzip: 99,
                                            score_compress: 80,
                                            score_progressive_jpeg: 79,
                                            score_cache: 50,
                                            score_cdn: 49
                                        }
                                    },
                                    runs: [
                                        {
                                            firstView: {
                                                pages: {
                                                    checklist: 'the second loadTime first firstView checklist',
                                                    details: 'the second loadTime first firstView details'
                                                }
                                            },
                                            repeatView: {
                                                pages: {
                                                    checklist: 'the second loadTime first repeatView checklist',
                                                    details: 'the second loadTime first repeatView details'
                                                }
                                            }
                                        },
                                        {
                                            firstView: {
                                                pages: {
                                                    checklist: 'the second loadTime second firstView checklist',
                                                    details: 'the second loadTime second firstView details'
                                                }
                                            },
                                            repeatView: {
                                                pages: {
                                                    checklist: 'the second loadTime second repeatView checklist',
                                                    details: 'the second loadTime second repeatView details'
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            SpeedIndex: {
                                data: {
                                    median: {
                                        firstView: {
                                            run: 0,
                                            TTFB: 10000,
                                            render: 20000,
                                            loadTime: 30000,
                                            SpeedIndex: 40000,
                                            bytesIn: 50000,
                                            requests: 60000,
                                            connections: 70000,
                                            server_rtt: 80000,
                                            score_gzip: 49,
                                            score_compress: 50,
                                            score_progressive_jpeg: 79,
                                            score_cache: 80,
                                            score_cdn: 100
                                        },
                                        repeatView: {
                                            run: 1,
                                            TTFB: 100000,
                                            render: 90000,
                                            loadTime: 80000,
                                            SpeedIndex: 70000,
                                            bytesIn: 60000,
                                            requests: 50000,
                                            connections: 40000,
                                            server_rtt: 30000,
                                            score_gzip: 99,
                                            score_compress: 80,
                                            score_progressive_jpeg: 79,
                                            score_cache: 50,
                                            score_cdn: 49
                                        }
                                    },
                                    runs: [
                                        {
                                            firstView: {
                                                pages: {
                                                    checklist: 'the second SpeedIndex first firstView checklist',
                                                    details: 'the second SpeedIndex first firstView details'
                                                }
                                            },
                                            repeatView: {
                                                pages: {
                                                    checklist: 'the second SpeedIndex first repeatView checklist',
                                                    details: 'the second SpeedIndex first repeatView details'
                                                }
                                            }
                                        },
                                        {
                                            firstView: {
                                                pages: {
                                                    checklist: 'the second SpeedIndex second firstView checklist',
                                                    details: 'the second SpeedIndex second firstView details'
                                                }
                                            },
                                            repeatView: {
                                                pages: {
                                                    checklist: 'the second SpeedIndex second repeatView checklist',
                                                    details: 'the second SpeedIndex second repeatView details'
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    times: { begin: new Date(), end: new Date() }
                });
            });

            teardown(function () {
                result = undefined;
            });

            test('render was called once', function () {
                assert.strictEqual(log.counts.render, 1);
                assert.isUndefined(log.these.render[0]);
            });

            test('render was called correctly [base properties]', function () {
                assert.lengthOf(log.args.render[0], 1);

                assert.isObject(log.args.render[0][0]);
                assert.lengthOf(Object.keys(log.args.render[0][0]), 14);

                assert.strictEqual(log.args.render[0][0].application, 'webpagetest-mapper');
                assert.match(log.args.render[0][0].version, /^[0-9]+\.[0-9]+\.[0-9]+$/);
                assert.strictEqual(log.args.render[0][0].date, (new Date()).toLocaleDateString());
                assert.strictEqual(log.args.render[0][0].count, 25);
                assert.strictEqual(log.args.render[0][0].location, 'L3963');
                assert.strictEqual(log.args.render[0][0].connection, 'Cable');
                assert.strictEqual(log.args.render[0][0].browser, 'Firefox');

                assert.isObject(log.args.render[0][0].times);
                assert.lengthOf(Object.keys(log.args.render[0][0].times), 2);

                assert.isArray(log.args.render[0][0].results);
                assert.lengthOf(log.args.render[0][0].results, 2);

                assert.isArray(log.args.render[0][0].charts);
                assert.lengthOf(log.args.render[0][0].charts, 10);

                assert.strictEqual(log.args.render[0][0].chartWidth, 832);
                assert.strictEqual(log.args.render[0][0].chartMargin, 140);
                assert.strictEqual(log.args.render[0][0].barHeight, 32);
                assert.strictEqual(log.args.render[0][0].labelOffset, 16);
            });

            test('render was called correctly [times]', function () {
                assert.match(log.args.render[0][0].times.begin, /^[0-9]+:[0-9]+:[0-9]+( (A|P)M)?$/);
                assert.match(log.args.render[0][0].times.end, /^[0-9]+:[0-9]+:[0-9]+( (A|P)M)? on [a-zA-Z0-9 ,\-\/]+$/);
            });

            test('render was called correctly [first result]', function () {
                assert.isObject(log.args.render[0][0].results[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0]), 6);
                assert.strictEqual(log.args.render[0][0].results[0].name, 'first name');
                assert.strictEqual(log.args.render[0][0].results[0].type, 'home');
                assert.strictEqual(log.args.render[0][0].results[0].url, 'first URL');
                assert.strictEqual(log.args.render[0][0].results[0].optimisationsUrl, 'first SpeedIndex first firstView checklist');

                assert.isObject(log.args.render[0][0].results[0].firstView);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].firstView), 14);

                assert.isObject(log.args.render[0][0].results[0].firstView.speedIndex);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].firstView.speedIndex), 3);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.speedIndex.url, 'first SpeedIndex first firstView details');
                assert.strictEqual(log.args.render[0][0].results[0].firstView.speedIndex.value, 40000);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.speedIndex.rtt, 80000);

                assert.isObject(log.args.render[0][0].results[0].firstView.firstByte);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].firstView.firstByte), 3);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.firstByte.url, 'first TTFB first firstView details');
                assert.strictEqual(log.args.render[0][0].results[0].firstView.firstByte.value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.firstByte.rtt, 8);

                assert.isObject(log.args.render[0][0].results[0].firstView.startRender);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].firstView.startRender), 3);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.startRender.url, 'first render first firstView details');
                assert.strictEqual(log.args.render[0][0].results[0].firstView.startRender.value, 20);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.startRender.rtt, 80);

                assert.isObject(log.args.render[0][0].results[0].firstView.load);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].firstView.load), 3);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.load.url, 'first loadTime first firstView details');
                assert.strictEqual(log.args.render[0][0].results[0].firstView.load.value, 300);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.load.rtt, 800);

                assert.isObject(log.args.render[0][0].results[0].firstView.bytes);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].firstView.bytes), 2);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.bytes.url, 'first SpeedIndex first firstView details');
                assert.strictEqual(log.args.render[0][0].results[0].firstView.bytes.value, 50000);

                assert.isObject(log.args.render[0][0].results[0].firstView.requests);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].firstView.requests), 2);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.requests.url, 'first SpeedIndex first firstView details');
                assert.strictEqual(log.args.render[0][0].results[0].firstView.requests.value, 60000);

                assert.isObject(log.args.render[0][0].results[0].firstView.connections);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].firstView.connections), 2);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.connections.url, 'first SpeedIndex first firstView details');
                assert.strictEqual(log.args.render[0][0].results[0].firstView.connections.value, 70000);

                assert.isObject(log.args.render[0][0].results[0].firstView.targetFirstByte);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].firstView.targetFirstByte), 2);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.targetFirstByte.rating, 'good');
                assert.strictEqual(log.args.render[0][0].results[0].firstView.targetFirstByte.value, 100);

                assert.isObject(log.args.render[0][0].results[0].firstView.persistent);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].firstView.persistent), 2);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.persistent.rating, 'bad');
                assert.isUndefined(log.args.render[0][0].results[0].firstView.persistent.value);

                assert.isObject(log.args.render[0][0].results[0].firstView.gzip);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].firstView.gzip), 2);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.gzip.rating, 'bad');
                assert.strictEqual(log.args.render[0][0].results[0].firstView.gzip.value, 49);

                assert.isObject(log.args.render[0][0].results[0].firstView.images);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].firstView.images), 2);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.images.rating, 'okay');
                assert.strictEqual(log.args.render[0][0].results[0].firstView.images.value, 50);

                assert.isObject(log.args.render[0][0].results[0].firstView.progJpeg);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].firstView.progJpeg), 2);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.progJpeg.rating, 'okay');
                assert.strictEqual(log.args.render[0][0].results[0].firstView.progJpeg.value, 79);

                assert.isObject(log.args.render[0][0].results[0].firstView.caching);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].firstView.caching), 2);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.caching.rating, 'good');
                assert.strictEqual(log.args.render[0][0].results[0].firstView.caching.value, 80);

                assert.isObject(log.args.render[0][0].results[0].firstView.cdn);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].firstView.cdn), 2);
                assert.strictEqual(log.args.render[0][0].results[0].firstView.cdn.rating, 'good');
                assert.strictEqual(log.args.render[0][0].results[0].firstView.cdn.value, 100);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].repeatView), 2);

                assert.isObject(log.args.render[0][0].results[0].repeatView.speedIndex);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].repeatView.speedIndex), 3);
                assert.strictEqual(log.args.render[0][0].results[0].repeatView.speedIndex.url, 'first SpeedIndex second repeatView details');
                assert.strictEqual(log.args.render[0][0].results[0].repeatView.speedIndex.value, 70000);
                assert.strictEqual(log.args.render[0][0].results[0].repeatView.speedIndex.rtt, 30000);
                assert.isObject(log.args.render[0][0].results[0].repeatView.load);
                assert.strictEqual(log.args.render[0][0].results[0].repeatView.load.url, 'first loadTime second repeatView details');
            });

            test('render was called correctly [second result]', function () {
                assert.isObject(log.args.render[0][0].results[1]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1]), 6);
                assert.strictEqual(log.args.render[0][0].results[1].name, 'the second name');
                assert.strictEqual(log.args.render[0][0].results[1].type, 'home');
                assert.strictEqual(log.args.render[0][0].results[1].url, 'the second URL');
                assert.strictEqual(log.args.render[0][0].results[1].optimisationsUrl, 'the second SpeedIndex first firstView checklist');
                assert.isObject(log.args.render[0][0].results[1].firstView);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].firstView), 14);

                assert.strictEqual(log.args.render[0][0].results[1].firstView.speedIndex.url, 'the second SpeedIndex first firstView details');
                assert.strictEqual(log.args.render[0][0].results[1].firstView.firstByte.url, 'the second TTFB first firstView details');
                assert.strictEqual(log.args.render[0][0].results[1].firstView.startRender.url, 'the second render first firstView details');
                assert.strictEqual(log.args.render[0][0].results[1].firstView.load.url, 'the second loadTime first firstView details');
                assert.strictEqual(log.args.render[0][0].results[1].firstView.bytes.url, 'the second SpeedIndex first firstView details');
                assert.strictEqual(log.args.render[0][0].results[1].firstView.requests.url, 'the second SpeedIndex first firstView details');
                assert.strictEqual(log.args.render[0][0].results[1].firstView.connections.url, 'the second SpeedIndex first firstView details');
                assert.strictEqual(log.args.render[0][0].results[1].repeatView.speedIndex.url, 'the second SpeedIndex second repeatView details');
                assert.strictEqual(log.args.render[0][0].results[1].repeatView.load.url, 'the second loadTime second repeatView details');
            });

            test('render was called correctly [first chart]', function () {
                assert.isObject(log.args.render[0][0].charts[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].charts[0]), 7);

                assert.strictEqual(log.args.render[0][0].charts[0].sectionTitle, 'Speed index, first view');
                assert.strictEqual(log.args.render[0][0].charts[0].title, 'Speed index, first view');
                assert.strictEqual(log.args.render[0][0].charts[0].height, 97);
                assert.strictEqual(log.args.render[0][0].charts[0].yAxisHeight, 70);
                assert.strictEqual(log.args.render[0][0].charts[0].label, 'First-view speed index (lower is better)');

                assert.isObject(log.args.render[0][0].charts[0].xAxis);
                assert.lengthOf(Object.keys(log.args.render[0][0].charts[0].xAxis), 3);
                assert.strictEqual(log.args.render[0][0].charts[0].xAxis.offset, 69);
                assert.strictEqual(log.args.render[0][0].charts[0].xAxis.width, 694);
                assert.strictEqual(log.args.render[0][0].charts[0].xAxis.labelPosition, 347);

                assert.isArray(log.args.render[0][0].charts[0].tests);
                assert.lengthOf(log.args.render[0][0].charts[0].tests, 2);

                assert.isObject(log.args.render[0][0].charts[0].tests[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].charts[0].tests[0]), 8);
                assert.strictEqual(log.args.render[0][0].charts[0].tests[0].offset, 0);
                assert.strictEqual(log.args.render[0][0].charts[0].tests[0].name, 'first name');
                assert.strictEqual(log.args.render[0][0].charts[0].tests[0].type, 'home');
                assert.strictEqual(log.args.render[0][0].charts[0].tests[0].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[0].tests[0].value, '40000');
                assert.strictEqual(log.args.render[0][0].charts[0].tests[0].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[0].tests[0].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].charts[0].tests[0].textAnchor, 'end');

                assert.isObject(log.args.render[0][0].charts[0].tests[1]);
                assert.lengthOf(Object.keys(log.args.render[0][0].charts[0].tests[1]), 8);
                assert.strictEqual(log.args.render[0][0].charts[0].tests[1].offset, 34);
                assert.strictEqual(log.args.render[0][0].charts[0].tests[1].name, 'the second name');
                assert.strictEqual(log.args.render[0][0].charts[0].tests[1].type, 'home');
                assert.strictEqual(log.args.render[0][0].charts[0].tests[1].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[0].tests[1].value, '40000');
                assert.strictEqual(log.args.render[0][0].charts[0].tests[1].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[0].tests[1].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].charts[0].tests[1].textAnchor, 'end');
            });

            test('render was called correctly [second chart]', function () {
                assert.isUndefined(log.args.render[0][0].charts[1].sectionTitle);
                assert.strictEqual(log.args.render[0][0].charts[1].title, 'Speed index, first view as RTTs');
                assert.strictEqual(log.args.render[0][0].charts[1].height, 97);
                assert.strictEqual(log.args.render[0][0].charts[1].yAxisHeight, 70);
                assert.strictEqual(log.args.render[0][0].charts[1].label, 'First-view speed index as a function of RTT');
                assert.strictEqual(log.args.render[0][0].charts[1].xAxis.offset, 69);

                assert.strictEqual(log.args.render[0][0].charts[1].tests[0].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[1].tests[0].value, '1');
                assert.strictEqual(log.args.render[0][0].charts[1].tests[0].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[1].tests[0].textAnchor, 'end');

                assert.strictEqual(log.args.render[0][0].charts[1].tests[1].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[1].tests[1].value, '1');
                assert.strictEqual(log.args.render[0][0].charts[1].tests[1].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[1].tests[1].textAnchor, 'end');
            });

            test('render was called correctly [third chart]', function () {
                assert.isObject(log.args.render[0][0].charts[2]);
                assert.lengthOf(Object.keys(log.args.render[0][0].charts[2]), 7);

                assert.strictEqual(log.args.render[0][0].charts[2].sectionTitle, 'Speed index, repeat view');
                assert.strictEqual(log.args.render[0][0].charts[2].title, 'Speed index, repeat view');
                assert.strictEqual(log.args.render[0][0].charts[2].height, 97);
                assert.strictEqual(log.args.render[0][0].charts[2].yAxisHeight, 70);
                assert.strictEqual(log.args.render[0][0].charts[2].label, 'Repeat-view speed index (lower is better)');
                assert.strictEqual(log.args.render[0][0].charts[2].xAxis.offset, 69);

                assert.strictEqual(log.args.render[0][0].charts[2].tests[0].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[2].tests[0].value, '70000');
                assert.strictEqual(log.args.render[0][0].charts[2].tests[0].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[2].tests[0].textAnchor, 'end');

                assert.strictEqual(log.args.render[0][0].charts[2].tests[1].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[2].tests[1].value, '70000');
                assert.strictEqual(log.args.render[0][0].charts[2].tests[1].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[2].tests[1].textAnchor, 'end');
            });

            test('render was called correctly [fourth chart]', function () {
                assert.strictEqual(log.args.render[0][0].charts[3].title, 'Speed index, repeat-view improvement');
                assert.strictEqual(log.args.render[0][0].charts[3].label, 'Repeat-view speed index as a percentage of first-view');
                assert.strictEqual(log.args.render[0][0].charts[3].xAxis.offset, 69);

                assert.strictEqual(log.args.render[0][0].charts[3].tests[0].barWidth, '692.00');
                assert.strictEqual(log.args.render[0][0].charts[3].tests[0].value, '175%');
                assert.strictEqual(log.args.render[0][0].charts[3].tests[0].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[3].tests[0].textAnchor, 'end');

                assert.strictEqual(log.args.render[0][0].charts[3].tests[1].barWidth, '692.00');
                assert.strictEqual(log.args.render[0][0].charts[3].tests[1].value, '175%');
                assert.strictEqual(log.args.render[0][0].charts[3].tests[1].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[3].tests[1].textAnchor, 'end');
            });

            test('render was called correctly [fifth chart]', function () {
                assert.strictEqual(log.args.render[0][0].charts[4].title, 'First byte in milliseconds');
                assert.strictEqual(log.args.render[0][0].charts[4].label, 'Time to first byte (milliseconds)');
                assert.strictEqual(log.args.render[0][0].charts[4].xAxis.offset, 69);

                assert.strictEqual(log.args.render[0][0].charts[4].tests[0].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[4].tests[0].value, '1');
                assert.strictEqual(log.args.render[0][0].charts[4].tests[0].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[4].tests[0].textAnchor, 'end');

                assert.strictEqual(log.args.render[0][0].charts[4].tests[1].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[4].tests[1].value, '1');
                assert.strictEqual(log.args.render[0][0].charts[4].tests[1].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[4].tests[1].textAnchor, 'end');
            });

            test('render was called correctly [sixth chart]', function () {
                assert.strictEqual(log.args.render[0][0].charts[5].title, 'First byte in RTTs');
                assert.strictEqual(log.args.render[0][0].charts[5].label, 'Time to first byte (RTTs)');
                assert.strictEqual(log.args.render[0][0].charts[5].xAxis.offset, 69);

                assert.strictEqual(log.args.render[0][0].charts[5].tests[0].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[5].tests[0].value, '1');
                assert.strictEqual(log.args.render[0][0].charts[5].tests[0].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[5].tests[0].textAnchor, 'end');

                assert.strictEqual(log.args.render[0][0].charts[5].tests[1].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[5].tests[1].value, '1');
                assert.strictEqual(log.args.render[0][0].charts[5].tests[1].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[5].tests[1].textAnchor, 'end');
            });

            test('render was called correctly [seventh chart]', function () {
                assert.strictEqual(log.args.render[0][0].charts[6].title, 'Start render, difference from first byte in milliseconds');
                assert.strictEqual(log.args.render[0][0].charts[6].label, 'Time from first byte until start render (milliseconds)');
                assert.strictEqual(log.args.render[0][0].charts[6].xAxis.offset, 69);

                assert.strictEqual(log.args.render[0][0].charts[6].tests[0].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[6].tests[0].value, '19');
                assert.strictEqual(log.args.render[0][0].charts[6].tests[0].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[6].tests[0].textAnchor, 'end');

                assert.strictEqual(log.args.render[0][0].charts[6].tests[1].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[6].tests[1].value, '19');
                assert.strictEqual(log.args.render[0][0].charts[6].tests[1].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[6].tests[1].textAnchor, 'end');
            });

            test('render was called correctly [eighth chart]', function () {
                assert.strictEqual(log.args.render[0][0].charts[7].title, 'Start render, difference from first byte in RTTs');
                assert.strictEqual(log.args.render[0][0].charts[7].label, 'Time from first byte until start render (RTTs)');
                assert.strictEqual(log.args.render[0][0].charts[7].xAxis.offset, 69);

                assert.isTrue(isNaN(log.args.render[0][0].charts[7].tests[0].barWidth));
                assert.strictEqual(log.args.render[0][0].charts[7].tests[0].value, '0');
                assert.strictEqual(log.args.render[0][0].charts[7].tests[0].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[7].tests[0].textAnchor, 'end');

                assert.isTrue(isNaN(log.args.render[0][0].charts[7].tests[1].barWidth));
                assert.strictEqual(log.args.render[0][0].charts[7].tests[1].value, '0');
                assert.strictEqual(log.args.render[0][0].charts[7].tests[1].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[7].tests[1].textAnchor, 'end');
            });

            test('render was called correctly [ninth chart]', function () {
                assert.strictEqual(log.args.render[0][0].charts[8].title, 'Load, difference from first byte in milliseconds');
                assert.strictEqual(log.args.render[0][0].charts[8].label, 'Time from first byte until load event (milliseconds)');
                assert.strictEqual(log.args.render[0][0].charts[8].xAxis.offset, 69);

                assert.strictEqual(log.args.render[0][0].charts[8].tests[0].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[8].tests[0].value, '299');
                assert.strictEqual(log.args.render[0][0].charts[8].tests[0].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[8].tests[0].textAnchor, 'end');

                assert.strictEqual(log.args.render[0][0].charts[8].tests[1].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[8].tests[1].value, '299');
                assert.strictEqual(log.args.render[0][0].charts[8].tests[1].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[8].tests[1].textAnchor, 'end');
            });

            test('render was called correctly [tenth chart]', function () {
                assert.strictEqual(log.args.render[0][0].charts[9].title, 'Load, difference from first byte in RTTs');
                assert.strictEqual(log.args.render[0][0].charts[9].label, 'Time from first byte until load event (RTTs)');
                assert.strictEqual(log.args.render[0][0].charts[9].xAxis.offset, 69);

                assert.isTrue(isNaN(log.args.render[0][0].charts[9].tests[0].barWidth));
                assert.strictEqual(log.args.render[0][0].charts[9].tests[0].value, '0');
                assert.strictEqual(log.args.render[0][0].charts[9].tests[0].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[9].tests[0].textAnchor, 'end');

                assert.isTrue(isNaN(log.args.render[0][0].charts[9].tests[1].barWidth));
                assert.strictEqual(log.args.render[0][0].charts[9].tests[1].value, '0');
                assert.strictEqual(log.args.render[0][0].charts[9].tests[1].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[9].tests[1].textAnchor, 'end');
            });
        });
    });

    function nop () {};
});

