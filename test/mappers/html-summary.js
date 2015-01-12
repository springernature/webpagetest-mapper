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

modulePath = '../../src/mappers/html-summary';

mockery.registerAllowable(modulePath);
mockery.registerAllowable('check-types');
mockery.registerAllowable('../../../package.json');

suite('mappers/html-summary:', function () {
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
            assert.match(log.args.join[0][0], /\/src\/mappers\/html-summary$/);
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

        suite('map:', function () {
            var result;

            setup(function () {
                result = mapper.map();
                mapper.map({
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
                                            requests: [ {}, {}, {} ],
                                            connections: 6,
                                            server_rtt: 7,
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
                                            requests: [ {} ],
                                            connections: 5,
                                            server_rtt: 4,
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
                                                    checklist: 'first TTFB first repeatView checklist',
                                                    details: 'first TTFB first repeatView details'
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
                                                    checklist: 'first TTFB second repeatView checklist',
                                                    details: 'first TTFB second repeatView details'
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
                                            requests: [ {}, {}, {} ],
                                            connections: 60,
                                            server_rtt: 70,
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
                                            requests: [ {}, {}, {} ],
                                            connections: 50,
                                            server_rtt: 40,
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
                                                    checklist: 'first render first repeatView checklist',
                                                    details: 'first render first repeatView details'
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
                                                    checklist: 'first render second repeatView checklist',
                                                    details: 'first render second repeatView details'
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
                                            requests: [],
                                            connections: 600,
                                            server_rtt: 700,
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
                                            requests: [ {}, {}, {} ],
                                            connections: 500,
                                            server_rtt: 400,
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
                                                    checklist: 'first loadTime first repeatView checklist',
                                                    details: 'first loadTime first repeatView details'
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
                                                    checklist: 'first loadTime second repeatView checklist',
                                                    details: 'first loadTime second repeatView details'
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
                                            requests: [ {}, {} ],
                                            connections: 60000,
                                            server_rtt: 70000,
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
                                            requests: [ {}, {} ],
                                            connections: 50000,
                                            server_rtt: 40000,
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
                                                    checklist: 'first SpeedIndex first repeatView checklist',
                                                    details: 'first SpeedIndex first repeatView details'
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
                                                    checklist: 'first SpeedIndex second repeatView checklist',
                                                    details: 'first SpeedIndex second repeatView details'
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
                                            requests: [ {}, {}, {} ],
                                            connections: 6,
                                            server_rtt: 7,
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
                                            requests: [ {} ],
                                            connections: 5,
                                            server_rtt: 4,
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
                                                    checklist: 'the second TTFB first repeatView checklist',
                                                    details: 'the second TTFB first repeatView details'
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
                                                    checklist: 'the second TTFB second repeatView checklist',
                                                    details: 'the second TTFB second repeatView details'
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
                                            requests: [ {}, {}, {} ],
                                            connections: 60,
                                            server_rtt: 70,
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
                                            requests: [ {}, {}, {} ],
                                            connections: 50,
                                            server_rtt: 40,
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
                                                    checklist: 'the second render first repeatView checklist',
                                                    details: 'the second render first repeatView details'
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
                                                    checklist: 'the second render second repeatView checklist',
                                                    details: 'the second render second repeatView details'
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
                                            requests: [],
                                            connections: 600,
                                            server_rtt: 700,
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
                                            requests: [ {}, {}, {} ],
                                            connections: 500,
                                            server_rtt: 400,
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
                                                    checklist: 'the second loadTime first repeatView checklist',
                                                    details: 'the second loadTime first repeatView details'
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
                                                    checklist: 'the second loadTime second repeatView checklist',
                                                    details: 'the second loadTime second repeatView details'
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
                                            requests: [ {}, {} ],
                                            connections: 60000,
                                            server_rtt: 70000,
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
                                            requests: [ {}, {} ],
                                            connections: 50000,
                                            server_rtt: 40000,
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
                                                    checklist: 'the second SpeedIndex first repeatView checklist',
                                                    details: 'the second SpeedIndex first repeatView details'
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
                                                    checklist: 'the second SpeedIndex second repeatView checklist',
                                                    details: 'the second SpeedIndex second repeatView details'
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

            // TODO: Tests - parse markup, check for elements and attributes
        });
    });

    function nop () {};
});

