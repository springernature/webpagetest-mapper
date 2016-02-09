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
                                                SpeedIndex: 77
                                            },
                                            repeatView: {
                                                SpeedIndex: 42
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            label: 'another_label-the_second_one',
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
                                                SpeedIndex: 77 
                                            },
                                            repeatView: {
                                                SpeedIndex: 42
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
                assert.strictEqual(log.args.render[0][0].chartWidth, 360);
                assert.strictEqual(log.args.render[0][0].chartHeight, 180);
                assert.strictEqual(log.args.render[0][0].chartMargin, 30);
                assert.strictEqual(log.args.render[0][0].chartPadding, 2);
                assert.strictEqual(log.args.render[0][0].axisWidth, 2);
                assert.strictEqual(log.args.render[0][0].xAxisLength, 298);
                assert.strictEqual(log.args.render[0][0].yAxisLength, 160);
                assert.strictEqual(log.args.render[0][0].xAxisOffset, 3);
                assert.strictEqual(log.args.render[0][0].yAxisOffset, 1);

                assert.isArray(log.args.render[0][0].results);
                assert.lengthOf(log.args.render[0][0].results, 2);
            });

            test('render was called correctly [first result]', function () {
                assert.isObject(log.args.render[0][0].results[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0]), 3);
                assert.strictEqual(log.args.render[0][0].results[0].id, 'first-label');
                assert.strictEqual(log.args.render[0][0].results[0].name, 'first name');
                assert.isArray(log.args.render[0][0].results[0].views);
                assert.lengthOf(log.args.render[0][0].results[0].views, 2);
            });

            test('render was called correctly [first view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[0]), 2);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].name, 'First view');
                assert.isArray(log.args.render[0][0].results[0].views[0].metrics);
                assert.lengthOf(log.args.render[0][0].results[0].views[0].metrics, 4);
            });

            test('render was called correctly [first-byte time, first view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[0].metrics[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[0].metrics[0]), 3);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].name, 'First-byte time');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].barWidth, 72.5);
                assert.isArray(log.args.render[0][0].results[0].views[0].metrics[0].ranges);
                assert.lengthOf(log.args.render[0][0].results[0].views[0].metrics[0].ranges, 4);
            });

            test('render was called correctly [first range, first-byte time, first view, first result]', function () {
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
            });

            test('render was called correctly [second range, first-byte time, first view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1]), 9);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].offsetX, 74.5);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].offsetY, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].type, 'less');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].barHeight, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].lowerBound, 2);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[1].upperBound, 5);
            });

            test('render was called correctly [third range, first-byte time, first view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2]), 9);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].offsetX, 149);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].offsetY, 0);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].barHeight, 156);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].value, 2);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].lowerBound, 5);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[2].upperBound, 7);
            });

            test('render was called correctly [fourth range, first-byte time, first view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3]), 9);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].offsetX, 223.5);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].offsetY, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].barHeight, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].lowerBound, 7);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[0].ranges[3].upperBound, 10);
            });

            test('render was called correctly [start-render time, first view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[0].metrics[1]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[0].metrics[1]), 3);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].name, 'Start-render time');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].barWidth, 72.5);
                assert.isArray(log.args.render[0][0].results[0].views[0].metrics[1].ranges);
                assert.lengthOf(log.args.render[0][0].results[0].views[0].metrics[1].ranges, 4);
            });

            test('render was called correctly [first range, start-render time, first view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[0].metrics[1].ranges[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[0].metrics[1].ranges[0]), 9);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[0].offsetX, 0);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[0].offsetY, 0);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[0].type, 'less');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[0].barHeight, 156);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[0].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[0].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[0].value, 4);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[0].lowerBound, -1988);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[0].upperBound, 2008);
            });

            test('render was called correctly [second range, start-render time, first view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[0].metrics[1].ranges[1]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[0].metrics[1].ranges[1]), 9);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[1].offsetX, 74.5);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[1].offsetY, 156);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[1].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[1].barHeight, 0);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[1].labelOffset, -2);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[1].textClass, 'chart-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[1].value, 0);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[1].lowerBound, 2008);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[1].upperBound, 6004);
            });

            test('render was called correctly [third range, start-render time, first view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[0].metrics[1].ranges[2]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[0].metrics[1].ranges[2]), 9);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[2].offsetX, 149);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[2].offsetY, 156);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[2].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[2].barHeight, 0);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[2].labelOffset, -2);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[2].textClass, 'chart-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[2].value, 0);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[2].lowerBound, 6004);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[2].upperBound, 10000);
            });

            test('render was called correctly [fourth range, start-render time, first view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[0].metrics[1].ranges[3]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[0].metrics[1].ranges[3]), 9);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[3].offsetX, 223.5);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[3].offsetY, 117);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[3].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[3].barHeight, 39);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[3].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[3].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[3].value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[3].lowerBound, 10000);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[1].ranges[3].upperBound, 13996);
            });

            test('render was called correctly [load event time, first view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[0].metrics[2]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[0].metrics[2]), 3);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[2].name, 'Load event time');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[2].barWidth, 296);
                assert.isArray(log.args.render[0][0].results[0].views[0].metrics[2].ranges);
                assert.lengthOf(log.args.render[0][0].results[0].views[0].metrics[2].ranges, 1);
            });

            test('render was called correctly [first range, load event time, first view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[0].metrics[2].ranges[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[0].metrics[2].ranges[0]), 9);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[2].ranges[0].offsetX, 0);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[2].ranges[0].offsetY, 0);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[2].ranges[0].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[2].ranges[0].barHeight, 156);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[2].ranges[0].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[2].ranges[0].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[2].ranges[0].value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[2].ranges[0].lowerBound, 42);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[2].ranges[0].upperBound, 42);
            });

            test('render was called correctly [speed index, first view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[0].metrics[3]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[0].metrics[3]), 3);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[3].name, 'Speed index');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[3].barWidth, 296);
                assert.isArray(log.args.render[0][0].results[0].views[0].metrics[3].ranges);
                assert.lengthOf(log.args.render[0][0].results[0].views[0].metrics[3].ranges, 1);
            });

            test('render was called correctly [first range, speed index, first view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[0].metrics[3].ranges[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[0].metrics[3].ranges[0]), 9);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[3].ranges[0].offsetX, 0);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[3].ranges[0].offsetY, 0);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[3].ranges[0].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[3].ranges[0].barHeight, 156);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[3].ranges[0].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[3].ranges[0].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[3].ranges[0].value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[3].ranges[0].lowerBound, 77);
                assert.strictEqual(log.args.render[0][0].results[0].views[0].metrics[3].ranges[0].upperBound, 77);
            });

            test('render was called correctly [repeat view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[1]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[1]), 2);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].name, 'Repeat view');
                assert.isArray(log.args.render[0][0].results[0].views[1].metrics);
                assert.lengthOf(log.args.render[0][0].results[0].views[1].metrics, 4);
            });

            test('render was called correctly [first-byte time, repeat view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[1].metrics[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[1].metrics[0]), 3);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].name, 'First-byte time');
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].barWidth, 72.5);
                assert.isArray(log.args.render[0][0].results[0].views[1].metrics[0].ranges);
                assert.lengthOf(log.args.render[0][0].results[0].views[1].metrics[0].ranges, 4);
            });

            test('render was called correctly [first range, first-byte time, repeat view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[1].metrics[0].ranges[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[1].metrics[0].ranges[0]), 9);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[0].offsetX, 0);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[0].offsetY, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[0].type, 'less');
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[0].barHeight, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[0].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[0].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[0].value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[0].lowerBound, 0);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[0].upperBound, 3);
            });

            test('render was called correctly [second range, first-byte time, repeat view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[1].metrics[0].ranges[1]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[1].metrics[0].ranges[1]), 9);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[1].offsetX, 74.5);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[1].offsetY, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[1].type, 'less');
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[1].barHeight, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[1].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[1].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[1].value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[1].lowerBound, 3);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[1].upperBound, 6);
            });

            test('render was called correctly [third range, first-byte time, repeat view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[1].metrics[0].ranges[2]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[1].metrics[0].ranges[2]), 9);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[2].offsetX, 149);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[2].offsetY, 0);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[2].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[2].barHeight, 156);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[2].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[2].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[2].value, 2);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[2].lowerBound, 6);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[2].upperBound, 8);
            });

            test('render was called correctly [fourth range, first-byte time, repeat view, first result]', function () {
                assert.isObject(log.args.render[0][0].results[0].views[1].metrics[0].ranges[3]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[0].views[1].metrics[0].ranges[3]), 9);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[3].offsetX, 223.5);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[3].offsetY, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[3].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[3].barHeight, 78);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[3].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[3].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[3].value, 1);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[3].lowerBound, 8);
                assert.strictEqual(log.args.render[0][0].results[0].views[1].metrics[0].ranges[3].upperBound, 11);
            });

            test('render was called correctly [second result]', function () {
                assert.isObject(log.args.render[0][0].results[1]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1]), 3);
                assert.strictEqual(log.args.render[0][0].results[1].id, 'another_label-the_second_one');
                assert.strictEqual(log.args.render[0][0].results[1].name, 'this is the second name property');
                assert.isArray(log.args.render[0][0].results[1].views);
                assert.lengthOf(log.args.render[0][0].results[1].views, 2);
            });

            test('render was called correctly [first view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[0]), 2);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].name, 'First view');
                assert.isArray(log.args.render[0][0].results[1].views[0].metrics);
                assert.lengthOf(log.args.render[0][0].results[1].views[0].metrics, 4);
            });

            test('render was called correctly [first-byte time, first view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[0].metrics[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[0].metrics[0]), 3);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[0].name, 'First-byte time');
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[0].barWidth, 296);
                assert.isArray(log.args.render[0][0].results[1].views[0].metrics[0].ranges);
                assert.lengthOf(log.args.render[0][0].results[1].views[0].metrics[0].ranges, 1);
            });

            test('render was called correctly [first range, first-byte time, first view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[0].metrics[0].ranges[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[0].metrics[0].ranges[0]), 9);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[0].ranges[0].offsetX, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[0].ranges[0].offsetY, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[0].ranges[0].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[0].ranges[0].barHeight, 156);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[0].ranges[0].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[0].ranges[0].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[0].ranges[0].value, 1);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[0].ranges[0].lowerBound, 17);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[0].ranges[0].upperBound, 17);
            });

            test('render was called correctly [start-render time, first view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[0].metrics[1]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[0].metrics[1]), 3);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[1].name, 'Start-render time');
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[1].barWidth, 296);
                assert.isArray(log.args.render[0][0].results[1].views[0].metrics[1].ranges);
                assert.lengthOf(log.args.render[0][0].results[1].views[0].metrics[1].ranges, 1);
            });

            test('render was called correctly [first range, start-render time, first view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[0].metrics[1].ranges[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[0].metrics[1].ranges[0]), 9);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[1].ranges[0].offsetX, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[1].ranges[0].offsetY, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[1].ranges[0].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[1].ranges[0].barHeight, 156);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[1].ranges[0].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[1].ranges[0].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[1].ranges[0].value, 1);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[1].ranges[0].lowerBound, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[1].ranges[0].upperBound, 0);
            });

            test('render was called correctly [load event time, first view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[0].metrics[2]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[0].metrics[2]), 3);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[2].name, 'Load event time');
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[2].barWidth, 296);
                assert.isArray(log.args.render[0][0].results[1].views[0].metrics[2].ranges);
                assert.lengthOf(log.args.render[0][0].results[1].views[0].metrics[2].ranges, 1);
            });

            test('render was called correctly [first range, load event time, first view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[0].metrics[2].ranges[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[0].metrics[2].ranges[0]), 9);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[2].ranges[0].offsetX, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[2].ranges[0].offsetY, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[2].ranges[0].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[2].ranges[0].barHeight, 156);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[2].ranges[0].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[2].ranges[0].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[2].ranges[0].value, 1);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[2].ranges[0].lowerBound, 3);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[2].ranges[0].upperBound, 3);
            });

            test('render was called correctly [speed index, first view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[0].metrics[3]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[0].metrics[3]), 3);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].name, 'Speed index');
                assert.isAbove(log.args.render[0][0].results[1].views[0].metrics[3].barWidth, 97.33);
                assert.isBelow(log.args.render[0][0].results[1].views[0].metrics[3].barWidth, 97.34);
                assert.isArray(log.args.render[0][0].results[1].views[0].metrics[3].ranges);
                assert.lengthOf(log.args.render[0][0].results[1].views[0].metrics[3].ranges, 3);
            });

            test('render was called correctly [first range, speed index, first view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[0].metrics[3].ranges[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[0].metrics[3].ranges[0]), 9);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[0].offsetX, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[0].offsetY, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[0].type, 'less');
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[0].barHeight, 156);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[0].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[0].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[0].value, 2);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[0].lowerBound, -58508);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[0].upperBound, 141453);
            });

            test('render was called correctly [second range, speed index, first view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[0].metrics[3].ranges[1]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[0].metrics[3].ranges[1]), 9);
                assert.isAbove(log.args.render[0][0].results[1].views[0].metrics[3].ranges[1].offsetX, 99.33);
                assert.isBelow(log.args.render[0][0].results[1].views[0].metrics[3].ranges[1].offsetX, 99.34);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[1].offsetY, 156);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[1].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[1].barHeight, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[1].labelOffset, -2);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[1].textClass, 'chart-label');
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[1].value, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[1].lowerBound, 141453);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[1].upperBound, 341415);
            });

            test('render was called correctly [third range, speed index, first view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[0].metrics[3].ranges[2]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[0].metrics[3].ranges[2]), 9);
                assert.isAbove(log.args.render[0][0].results[1].views[0].metrics[3].ranges[2].offsetX, 198.66);
                assert.isBelow(log.args.render[0][0].results[1].views[0].metrics[3].ranges[2].offsetX, 198.67);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[2].offsetY, 78);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[2].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[2].barHeight, 78);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[2].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[2].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[2].value, 1);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[2].lowerBound, 341415);
                assert.strictEqual(log.args.render[0][0].results[1].views[0].metrics[3].ranges[2].upperBound, 541376);
            });

            test('render was called correctly [repeat view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[1]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[1]), 2);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].name, 'Repeat view');
                assert.isArray(log.args.render[0][0].results[1].views[1].metrics);
                assert.lengthOf(log.args.render[0][0].results[1].views[1].metrics, 4);
            });

            test('render was called correctly [first-byte time, repeat view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[1].metrics[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[1].metrics[0]), 3);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[0].name, 'First-byte time');
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[0].barWidth, 296);
                assert.isArray(log.args.render[0][0].results[1].views[1].metrics[0].ranges);
                assert.lengthOf(log.args.render[0][0].results[1].views[1].metrics[0].ranges, 1);
            });

            test('render was called correctly [first range, first-byte time, repeat view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[1].metrics[0].ranges[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[1].metrics[0].ranges[0]), 9);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[0].ranges[0].offsetX, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[0].ranges[0].offsetY, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[0].ranges[0].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[0].ranges[0].barHeight, 156);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[0].ranges[0].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[0].ranges[0].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[0].ranges[0].value, 1);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[0].ranges[0].lowerBound, 16);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[0].ranges[0].upperBound, 16);
            });

            test('render was called correctly [start-render time, repeat view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[1].metrics[1]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[1].metrics[1]), 3);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[1].name, 'Start-render time');
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[1].barWidth, 296);
                assert.isArray(log.args.render[0][0].results[1].views[1].metrics[1].ranges);
                assert.lengthOf(log.args.render[0][0].results[1].views[1].metrics[1].ranges, 1);
            });

            test('render was called correctly [first range, start-render time, repeat view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[1].metrics[1].ranges[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[1].metrics[1].ranges[0]), 9);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[1].ranges[0].offsetX, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[1].ranges[0].offsetY, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[1].ranges[0].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[1].ranges[0].barHeight, 156);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[1].ranges[0].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[1].ranges[0].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[1].ranges[0].value, 1);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[1].ranges[0].lowerBound, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[1].ranges[0].upperBound, 0);
            });

            test('render was called correctly [load event time, repeat view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[1].metrics[2]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[1].metrics[2]), 3);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[2].name, 'Load event time');
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[2].barWidth, 296);
                assert.isArray(log.args.render[0][0].results[1].views[1].metrics[2].ranges);
                assert.lengthOf(log.args.render[0][0].results[1].views[1].metrics[2].ranges, 1);
            });

            test('render was called correctly [first range, load event time, repeat view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[1].metrics[2].ranges[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[1].metrics[2].ranges[0]), 9);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[2].ranges[0].offsetX, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[2].ranges[0].offsetY, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[2].ranges[0].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[2].ranges[0].barHeight, 156);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[2].ranges[0].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[2].ranges[0].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[2].ranges[0].value, 1);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[2].ranges[0].lowerBound, 3);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[2].ranges[0].upperBound, 3);
            });

            test('render was called correctly [speed index, repeat view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[1].metrics[3]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[1].metrics[3]), 3);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].name, 'Speed index');
                assert.isAbove(log.args.render[0][0].results[1].views[1].metrics[3].barWidth, 97.33);
                assert.isBelow(log.args.render[0][0].results[1].views[1].metrics[3].barWidth, 97.34);
                assert.isArray(log.args.render[0][0].results[1].views[1].metrics[3].ranges);
                assert.lengthOf(log.args.render[0][0].results[1].views[1].metrics[3].ranges, 3);
            });

            test('render was called correctly [first range, speed index, repeat view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[1].metrics[3].ranges[0]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[1].metrics[3].ranges[0]), 9);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[0].offsetX, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[0].offsetY, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[0].type, 'less');
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[0].barHeight, 156);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[0].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[0].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[0].value, 2);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[0].lowerBound, -206);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[0].upperBound, 698);
            });

            test('render was called correctly [second range, speed index, repeat view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[1].metrics[3].ranges[1]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[1].metrics[3].ranges[1]), 9);
                assert.isAbove(log.args.render[0][0].results[1].views[1].metrics[3].ranges[1].offsetX, 99.33);
                assert.isBelow(log.args.render[0][0].results[1].views[1].metrics[3].ranges[1].offsetX, 99.34);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[1].offsetY, 156);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[1].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[1].barHeight, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[1].labelOffset, -2);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[1].textClass, 'chart-label');
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[1].value, 0);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[1].lowerBound, 698);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[1].upperBound, 1602);
            });

            test('render was called correctly [third range, speed index, repeat view, second result]', function () {
                assert.isObject(log.args.render[0][0].results[1].views[1].metrics[3].ranges[2]);
                assert.lengthOf(Object.keys(log.args.render[0][0].results[1].views[1].metrics[3].ranges[2]), 9);
                assert.isAbove(log.args.render[0][0].results[1].views[1].metrics[3].ranges[2].offsetX, 198.66);
                assert.isBelow(log.args.render[0][0].results[1].views[1].metrics[3].ranges[2].offsetX, 198.67);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[2].offsetY, 78);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[2].type, 'greater');
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[2].barHeight, 78);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[2].labelOffset, 16);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[2].textClass, 'chart-label chart-bar-label');
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[2].value, 1);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[2].lowerBound, 1602);
                assert.strictEqual(log.args.render[0][0].results[1].views[1].metrics[3].ranges[2].upperBound, 2506);
            });
        });
    });

    function nop () {};
});

