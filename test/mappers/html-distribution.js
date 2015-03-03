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

modulePath = '../../src/mappers/html-distribution';

mockery.registerAllowable(modulePath);
mockery.registerAllowable('check-types');
mockery.registerAllowable('../../../package.json');

suite('mappers/html-distribution:', function () {
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

        test('map throws with bad data', function () {
            assert.throws(function () {
                mapper.map({}, { data: {} });
            });
        });

        test('map does not throw with good arguments', function () {
            assert.doesNotThrow(function () {
                mapper.map({}, { data: [] });
            });
        });

        test('path.join was called once', function () {
            assert.strictEqual(log.counts.join, 1);
            assert.strictEqual(log.these.join[0], require('path'));
        });

        test('path.join was called correctly', function () {
            assert.lengthOf(log.args.join[0], 2);
            assert.match(log.args.join[0][0], /\/src\/mappers\/html-distribution$/);
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
                    log: spooks.obj({
                        archetype: { info: nop, warn: nop, error: nop },
                        log: log
                    })
                }, {
                    data: [
                        {
                            label: 'first-label',
                            name: 'first name',
                            TTFB: {
                                data: {
                                    runs: {
                                        '1': {
                                            firstView: {
                                                TTFB: 1
                                            },
                                            repeatView: {
                                                TTFB: 2
                                            }
                                        },
                                        '2': {
                                            firstView: {
                                                TTFB: 3
                                            },
                                            repeatView: {
                                                TTFB: 4
                                            }
                                        },
                                        '3': {
                                            firstView: {
                                                TTFB: 5
                                            },
                                            repeatView: {
                                                TTFB: 6
                                            }
                                        },
                                        '4': {
                                            firstView: {
                                                TTFB: 7
                                            },
                                            repeatView: {
                                                TTFB: 8
                                            }
                                        },
                                        '5': {
                                            firstView: {
                                                TTFB: 9
                                            },
                                            repeatView: {
                                                TTFB: 10
                                            }
                                        }
                                    }
                                }
                            },
                            render: {
                                data: {
                                    runs: {
                                        '1': {
                                            firstView: {
                                                render: 10
                                            },
                                            repeatView: {
                                                render: 5
                                            }
                                        },
                                        '2': {
                                            firstView: {
                                                render: 10 
                                            },
                                            repeatView: {
                                                render: 5
                                            }
                                        },
                                        '3': {
                                            firstView: {
                                                render: 10
                                            },
                                            repeatView: {
                                                render: 5
                                            }
                                        },
                                        '4': {
                                            firstView: {
                                                render: 10000
                                            },
                                            repeatView: {
                                                render: 5000
                                            }
                                        },
                                        '5': {
                                            firstView: {
                                                render: 10
                                            },
                                            repeatView: {
                                                render: 5
                                            }
                                        }
                                    }
                                }
                            },
                            loadTime: {
                                data: {
                                    runs: {
                                        '1': {
                                            firstView: {
                                                loadTime: 42
                                            },
                                            repeatView: {
                                                loadTime: 77
                                            }
                                        }
                                    }
                                }
                            },
                            SpeedIndex: {
                                data: {
                                    runs: {
                                        '1': {
                                            firstView: {
                                                SpeedIndex: 42
                                            },
                                            repeatView: {
                                                SpeedIndex: 77
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            label: 'another_sodding_label-the_second_one',
                            name: 'this is the second name property',
                            TTFB: {
                                data: {
                                    runs: {
                                        '1': {
                                            firstView: {
                                                TTFB: 17
                                            },
                                            repeatView: {
                                                TTFB: 16
                                            }
                                        }
                                    }
                                }
                            },
                            render: {
                                data: {
                                    runs: {
                                        '1': {
                                            firstView: {
                                                render: 0
                                            },
                                            repeatView: {
                                                render: 0
                                            }
                                        }
                                    }
                                }
                            },
                            loadTime: {
                                data: {
                                    runs: {
                                        '1': {
                                            firstView: {
                                                loadTime: 3
                                            },
                                            repeatView: {
                                                loadTime: 3
                                            }
                                        }
                                    }
                                }
                            },
                            SpeedIndex: {
                                data: {
                                    runs: {
                                        '1': {
                                            firstView: {
                                                SpeedIndex: 42
                                            },
                                            repeatView: {
                                                SpeedIndex: 77
                                            }
                                        },
                                        '2': {
                                            firstView: {
                                                SpeedIndex: 42 
                                            },
                                            repeatView: {
                                                SpeedIndex: 77
                                            }
                                        },
                                        '3': {
                                            firstView: {
                                                SpeedIndex: 424242
                                            },
                                            repeatView: {
                                                SpeedIndex: 1977
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    ]
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
                assert.lengthOf(Object.keys(log.args.render[0][0]), 12);

                assert.strictEqual(log.args.render[0][0].application, 'webpagetest-mapper');
                assert.match(log.args.render[0][0].version, /^[0-9]+\.[0-9]+\.[0-9]+$/);

                assert.isArray(log.args.render[0][0].results);
                assert.lengthOf(log.args.render[0][0].results, 2);

                assert.strictEqual(log.args.render[0][0].chartWidth, 360);
                assert.strictEqual(log.args.render[0][0].chartHeight, 180);
                assert.strictEqual(log.args.render[0][0].chartMargin, 30);
                assert.strictEqual(log.args.render[0][0].chartPadding, 2);
                assert.strictEqual(log.args.render[0][0].axisWidth, 2);
                assert.strictEqual(log.args.render[0][0].xAxisLength, 298);
                assert.strictEqual(log.args.render[0][0].yAxisLength, 160);
                assert.strictEqual(log.args.render[0][0].xAxisOffset, 3);
                assert.strictEqual(log.args.render[0][0].yAxisOffset, 1);
            });

            test('render was called correctly [first result]', function () {
                assert.isObject(log.args.render[0][0].results[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0]), 3);
                assert.strictEqual(log.args.render[0][0].results[0].id, 'first-label');
                assert.strictEqual(log.args.render[0][0].results[0].name, 'first name');
                assert.isArray(log.args.render[0][0].results[0].views);
                assert.lengthOf(log.args.render[0][0].results[0].views, 2);

                assert.isObject(log.args.render[0][0].results[0].views[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[0]), 2);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].name, 'First view');
                assert.isArray(log.args.render[0][0].results[0].views[0].metrics);
                assert.lengthOf(log.args.render[0][0].results[0].views[0].metrics, 4);
                assert.isObject(log.args.render[0][0].results[0].views[0].metrics[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[0].metrics[0]), 3);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].name, 'First-byte time');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].barWidth, 72.5);
                assert.isArray(log.args.render[0][0].results[0].views[0].metrics[0].ranges);
                assert.lengthOf(log.args.render[0][0].results[0].views[0].metrics[0].ranges, 4);
                assert.isObject(log.args.render[0][0].results[0].views[0].metrics[0].ranges[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[0].metrics[0].ranges[0]), 9);

                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[0].offsetX, 0);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[0].offsetY, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[0].type, 'less');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[0].barHeight, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[0].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[0].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[0].value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[0].lowerBound, -1);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[0].upperBound, 2);

                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].offsetX, 74.5);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].offsetY, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].type, 'less');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].barHeight, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].lowerBound, 2);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].upperBound, 5);

                // TODO: You are here, remember to iterate through the metrics, views and results
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].offsetX, 74.5);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].offsetY, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].type, 'less');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].barHeight, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].lowerBound, 2);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].upperBound, 5);

                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].offsetX, 74.5);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].offsetY, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].type, 'less');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].barHeight, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].lowerBound, 2);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].upperBound, 5);

                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[4].offsetX, 74.5);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[4].offsetY, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[4].type, 'less');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[4].barHeight, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[4].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[4].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[4].value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[4].lowerBound, 2);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[4].upperBound, 5);

                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[5].offsetX, 74.5);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[5].offsetY, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[5].type, 'less');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[5].barHeight, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[5].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[5].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[5].value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[5].lowerBound, 2);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[5].upperBound, 5);

                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[6].offsetX, 74.5);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[6].offsetY, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[6].type, 'less');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[6].barHeight, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[6].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[6].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[6].value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[6].lowerBound, 2);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[6].upperBound, 5);

                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[7].offsetX, 74.5);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[7].offsetY, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[7].type, 'less');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[7].barHeight, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[7].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[7].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[7].value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[7].lowerBound, 2);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[7].upperBound, 5);

                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[8].offsetX, 74.5);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[8].offsetY, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[8].type, 'less');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[8].barHeight, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[8].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[8].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[8].value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[8].lowerBound, 2);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[8].upperBound, 5);
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
                assert.lengthOf(Object.keys(log.args.render[0][0].charts[0]), 5);

                assert.strictEqual(log.args.render[0][0].charts[0].title, 'Speed index, first view');
                assert.strictEqual(log.args.render[0][0].charts[0].height, 97);
                assert.strictEqual(log.args.render[0][0].charts[0].yAxisHeight, 70);
                assert.strictEqual(log.args.render[0][0].charts[0].label, 'First-view speed index (lower is better)');

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
                assert.isObject(log.args.render[0][0].charts[1]);
                assert.lengthOf(Object.keys(log.args.render[0][0].charts[1]), 5);

                assert.strictEqual(log.args.render[0][0].charts[1].title, 'Speed index, repeat view');
                assert.strictEqual(log.args.render[0][0].charts[1].height, 97);
                assert.strictEqual(log.args.render[0][0].charts[1].yAxisHeight, 70);
                assert.strictEqual(log.args.render[0][0].charts[1].label, 'Repeat-view speed index (lower is better)');

                assert.isArray(log.args.render[0][0].charts[1].tests);
                assert.lengthOf(log.args.render[0][0].charts[1].tests, 2);

                assert.isObject(log.args.render[0][0].charts[1].tests[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].charts[1].tests[0]), 8);
                assert.strictEqual(log.args.render[0][0].charts[1].tests[0].offset, 0);
                assert.strictEqual(log.args.render[0][0].charts[1].tests[0].name, 'first name');
                assert.strictEqual(log.args.render[0][0].charts[1].tests[0].type, 'home');
                assert.strictEqual(log.args.render[0][0].charts[1].tests[0].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[1].tests[0].value, '70000');
                assert.strictEqual(log.args.render[0][0].charts[1].tests[0].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[1].tests[0].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].charts[1].tests[0].textAnchor, 'end');

                assert.isObject(log.args.render[0][0].charts[1].tests[1]);
                assert.lengthOf(Object.keys(log.args.render[0][0].charts[1].tests[1]), 8);
                assert.strictEqual(log.args.render[0][0].charts[1].tests[1].offset, 34);
                assert.strictEqual(log.args.render[0][0].charts[1].tests[1].name, 'the second name');
                assert.strictEqual(log.args.render[0][0].charts[1].tests[1].type, 'home');
                assert.strictEqual(log.args.render[0][0].charts[1].tests[1].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[1].tests[1].value, '70000');
                assert.strictEqual(log.args.render[0][0].charts[1].tests[1].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[1].tests[1].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].charts[1].tests[1].textAnchor, 'end');
            });

            test('render was called correctly [third chart]', function () {
                assert.strictEqual(log.args.render[0][0].charts[2].title, 'Speed index, repeat-view improvement');
                assert.strictEqual(log.args.render[0][0].charts[2].label, 'Repeat-view speed index as a percentage of first-view (lower is better)');
                assert.strictEqual(log.args.render[0][0].charts[2].tests[0].barWidth, '692.00');
                assert.strictEqual(log.args.render[0][0].charts[2].tests[0].value, '175%');
                assert.strictEqual(log.args.render[0][0].charts[2].tests[0].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[2].tests[0].textAnchor, 'end');

                assert.strictEqual(log.args.render[0][0].charts[2].tests[1].barWidth, '692.00');
                assert.strictEqual(log.args.render[0][0].charts[2].tests[1].value, '175%');
                assert.strictEqual(log.args.render[0][0].charts[2].tests[1].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[2].tests[1].textAnchor, 'end');
            });

            test('render was called correctly [fourth chart]', function () {
                assert.strictEqual(log.args.render[0][0].charts[3].title, 'First byte');
                assert.strictEqual(log.args.render[0][0].charts[3].label, 'Time to first byte (milliseconds)');
                assert.strictEqual(log.args.render[0][0].charts[3].tests[0].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[3].tests[0].value, '1');
                assert.strictEqual(log.args.render[0][0].charts[3].tests[0].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[3].tests[0].textAnchor, 'end');

                assert.strictEqual(log.args.render[0][0].charts[3].tests[1].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[3].tests[1].value, '1');
                assert.strictEqual(log.args.render[0][0].charts[3].tests[1].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[3].tests[1].textAnchor, 'end');
            });

            test('render was called correctly [fifth chart]', function () {
                assert.strictEqual(log.args.render[0][0].charts[4].title, 'Start render, difference from first byte');
                assert.strictEqual(log.args.render[0][0].charts[4].label, 'Time from first byte until start render (milliseconds)');
                assert.strictEqual(log.args.render[0][0].charts[4].tests[0].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[4].tests[0].value, '19');
                assert.strictEqual(log.args.render[0][0].charts[4].tests[0].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[4].tests[0].textAnchor, 'end');

                assert.strictEqual(log.args.render[0][0].charts[4].tests[1].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[4].tests[1].value, '19');
                assert.strictEqual(log.args.render[0][0].charts[4].tests[1].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[4].tests[1].textAnchor, 'end');
            });

            test('render was called correctly [sixth chart]', function () {
                assert.strictEqual(log.args.render[0][0].charts[5].title, 'Load, difference from first byte');
                assert.strictEqual(log.args.render[0][0].charts[5].label, 'Time from first byte until load event (milliseconds)');
                assert.strictEqual(log.args.render[0][0].charts[5].tests[0].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[5].tests[0].value, '299');
                assert.strictEqual(log.args.render[0][0].charts[5].tests[0].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[5].tests[0].textAnchor, 'end');

                assert.strictEqual(log.args.render[0][0].charts[5].tests[1].barWidth, 692);
                assert.strictEqual(log.args.render[0][0].charts[5].tests[1].value, '299');
                assert.strictEqual(log.args.render[0][0].charts[5].tests[1].textOrientation, '-');
                assert.strictEqual(log.args.render[0][0].charts[5].tests[1].textAnchor, 'end');
            });

            test('render was called correctly [xAxis]', function () {
                assert.strictEqual(log.args.render[0][0].xAxis.offset, 69);
                assert.strictEqual(log.args.render[0][0].xAxis.width, 694);
                assert.strictEqual(log.args.render[0][0].xAxis.labelPosition, 347);
            });
        });
    });

    function nop () {};
});

