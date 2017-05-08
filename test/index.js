'use strict';

const FootballData = require('../src/index');
const expect = require('chai').expect;
const rewire = require('rewire');
const nock = require('nock');
const sinon = require('sinon');

const BASEURL = 'api.football-data.org';
const VERSION = 'v1';
const API = nock(`https://${BASEURL}`);

/* global describe context it before after beforeEach afterEach */
/* eslint-disable prefer-arrow-callback, no-unused-expressions, func-names, no-underscore-dangle */

describe('FootballData', function () {
    context('constructor', function () {
        it('should set parameter as options', function () {
            const options = { auth: 'test' };
            const FD = new FootballData(options);
            expect(FD.options).to.be.deep.equal(options);
        });

        it('should set all parameters as options', function () {
            const options = {
                auth: 'auth123',
                response: 'full',
                meta: true
            };
            const FD = new FootballData(options);
            expect(FD.options).to.be.deep.equal(options);
        });

        it('should set default options', function () {
            let FD = new FootballData();
            expect(FD.options).to.be.deep.equal({});

            FD = new FootballData({
                auth: 'authFOO123',
                response: 'extra',
                meta: 'true'
            });
            expect(FD.options).to.be.deep.equal({});
        });
    });

    context('static methods', function () {
        describe('leagueAbbrevations', function () {
            it('should return object', function () {
                expect(FootballData.leagueAbbrevations()).to.be.an('object');
            });

            it('should have 22 keys', function () {
                expect(Object.keys(FootballData.leagueAbbrevations()).length).to.be.equal(22);
            });

            it('should match abbrevation keys', function () {
                expect(FootballData.leagueAbbrevations()).to.have.all.keys(
                    'BL1', 'BL2', 'BL3', 'DFB', 'PL', 'EL1', 'ELC', 'FAC', 'SA', 'SB', 'PD',
                    'SD', 'CDR', 'FL1', 'FL2', 'DED', 'PPL', 'GSL', 'CL', 'EL', 'EC', 'WC'
                );
            });

            it('should match abbrevations to league names', function () {
                const abbrevations = FootballData.leagueAbbrevations();
                expect(abbrevations.BL1).to.be.equal('1. Bundesliga');
                expect(abbrevations.BL2).to.be.equal('2. Bundesliga');
                expect(abbrevations.BL3).to.be.equal('3. Bundesliga');
                expect(abbrevations.DFB).to.be.equal('DFB-Pokal');
                expect(abbrevations.PL).to.be.equal('Premiere League');
                expect(abbrevations.EL1).to.be.equal('League One');
                expect(abbrevations.ELC).to.be.equal('Championship');
                expect(abbrevations.FAC).to.be.equal('FA-Cup');
                expect(abbrevations.SA).to.be.equal('Serie A');
                expect(abbrevations.SB).to.be.equal('Serie B');
                expect(abbrevations.PD).to.be.equal('Primera Division');
                expect(abbrevations.SD).to.be.equal('Segunda Division');
                expect(abbrevations.CDR).to.be.equal('Copa del Rey');
                expect(abbrevations.FL1).to.be.equal('Ligue 1');
                expect(abbrevations.FL2).to.be.equal('Ligue 2');
                expect(abbrevations.DED).to.be.equal('Eredivisie');
                expect(abbrevations.PPL).to.be.equal('Primeira Liga');
                expect(abbrevations.GSL).to.be.equal('Primeira Liga');
                expect(abbrevations.CL).to.be.equal('Champions-League');
                expect(abbrevations.EL).to.be.equal('UEFA-Cup');
                expect(abbrevations.EC).to.be.equal('European-Cup of Nations');
                expect(abbrevations.WC).to.be.equal('World-Cup');
            });
        });

        describe('filters', function () {
            it('should return object', function () {
                expect(FootballData.filters()).to.be.an('object');
            });

            it('should have 9 keys', function () {
                expect(Object.keys(FootballData.filters()).length).to.be.equal(9);
            });

            it('should match filter keys', function () {
                expect(FootballData.filters()).to.have.all.keys(
                    'id', 'matchday', 'season', 'head2head', 'venue', 'league', 'timeFrame', 'timeFrameStart', 'timeFrameEnd'
                );
            });

            it('should match id', function () {
                const id = FootballData.filters().id;
                expect(436287).to.match(id);
                expect(0).to.match(id);
                expect(-1).to.not.match(id);
                expect('foo23234').to.not.match(id);
                expect('23bar').to.not.match(id);
            });

            it('should match matchday', function () {
                const matchday = FootballData.filters().matchday;
                expect(436287).to.match(matchday);
                expect(0).to.match(matchday);
                expect(54).to.match(matchday);
                expect(-1).to.not.match(matchday);
                expect('foo23234').to.not.match(matchday);
                expect('23bar').to.not.match(matchday);
            });

            it('should match season', function () {
                const season = FootballData.filters().season;
                expect(1998).to.match(season);
                expect(2017).to.match(season);
                expect(436287).to.not.match(season);
                expect(0).to.not.match(season);
                expect(54).to.not.match(season);
                expect(-1997).to.not.match(season);
                expect('foo23234').to.not.match(season);
                expect('23bar').to.not.match(season);
            });

            it('should match head2head', function () {
                const head2head = FootballData.filters().head2head;
                expect(436287).to.match(head2head);
                expect(0).to.match(head2head);
                expect(-1).to.not.match(head2head);
                expect('foo23234').to.not.match(head2head);
                expect('23bar').to.not.match(head2head);
            });

            it('should match venue', function () {
                const venue = FootballData.filters().venue;
                expect('away').to.match(venue);
                expect('home').to.match(venue);
                expect(436287).to.not.match(venue);
                expect(0).to.not.match(venue);
                expect(-1).to.not.match(venue);
                expect('foo23home234').to.not.match(venue);
                expect('23bar').to.not.match(venue);
            });

            it('should match league', function () {
                const league = FootballData.filters().league;
                expect('BL1').to.match(league);
                expect('BL1,WC').to.match(league);
                expect('BL1,ECL56,WC').to.not.match(league);
                expect('ECL56,BL1,WC').to.not.match(league);
                expect(436287).to.not.match(league);
                expect(0).to.not.match(league);
                expect(-1).to.not.match(league);
                expect('foo23home').to.not.match(league);
                expect('23bar').to.not.match(league);
            });

            it('should match timeFrame', function () {
                const timeFrame = FootballData.filters().timeFrame;
                expect('p5').to.match(timeFrame);
                expect('n14').to.match(timeFrame);
                expect('n10').to.match(timeFrame);
                expect('n01').to.not.match(timeFrame);
                expect('p145').to.not.match(timeFrame);
                expect('p').to.not.match(timeFrame);
                expect(436287).to.not.match(timeFrame);
                expect(0).to.not.match(timeFrame);
                expect(-1).to.not.match(timeFrame);
                expect('foo23home234').to.not.match(timeFrame);
                expect('23bar').to.not.match(timeFrame);
            });

            it('should match timeFrameStart', function () {
                const timeFrameStart = FootballData.filters().timeFrameStart;
                expect('1999-12-31').to.match(timeFrameStart);
                expect('2017-05-05').to.match(timeFrameStart);
                expect('2005-10-17').to.match(timeFrameStart);
                expect('17-05-05').to.not.match(timeFrameStart);
                expect('2017/05/05').to.not.match(timeFrameStart);
                expect('05-05-2017').to.not.match(timeFrameStart);
                expect(436287).to.not.match(timeFrameStart);
                expect(0).to.not.match(timeFrameStart);
                expect(-1).to.not.match(timeFrameStart);
                expect('foo2017-05-05234').to.not.match(timeFrameStart);
                expect('23bar').to.not.match(timeFrameStart);
            });

            it('should match timeFrameEnd', function () {
                const timeFrameEnd = FootballData.filters().timeFrameEnd;
                expect('1999-12-31').to.match(timeFrameEnd);
                expect('2017-05-05').to.match(timeFrameEnd);
                expect('2005-10-17').to.match(timeFrameEnd);
                expect('17-05-05').to.not.match(timeFrameEnd);
                expect('2017/05/05').to.not.match(timeFrameEnd);
                expect('05-05-2017').to.not.match(timeFrameEnd);
                expect(436287).to.not.match(timeFrameEnd);
                expect(0).to.not.match(timeFrameEnd);
                expect(-1).to.not.match(timeFrameEnd);
                expect('foo2017-05-05234').to.not.match(timeFrameEnd);
                expect('23bar').to.not.match(timeFrameEnd);
            });
        });

        describe('options', function () {
            it('should return object', function () {
                expect(FootballData.options()).to.be.an('object');
            });

            it('should have 2 keys', function () {
                expect(Object.keys(FootballData.options()).length).to.be.equal(2);
            });

            it('should match option keys', function () {
                expect(FootballData.options()).to.have.all.keys(
                    'auth', 'response'
                );
            });

            it('should match auth', function () {
                const auth = FootballData.options().auth;
                expect('foo23234').to.match(auth);
                expect('23bar').to.match(auth);
                expect('foobar').to.match(auth);
                expect(436287).to.match(auth);
                expect('foo0bar').to.match(auth);
                expect(0).to.match(auth);
                expect('fooXbar').to.not.match(auth);
                expect(-1).to.not.match(auth);
            });

            it('should match response', function () {
                const response = FootballData.options().response;
                expect('full').to.match(response);
                expect('minified').to.match(response);
                expect('compressed').to.match(response);
                expect(436287).to.not.match(response);
                expect(0).to.not.match(response);
                expect(54).to.not.match(response);
                expect(-1).to.not.match(response);
                expect('foo2minified3234').to.not.match(response);
                expect('23bar').to.not.match(response);
            });
        });

        describe('buildMetaData', function () {
            it('should return object', function () {
                expect(FootballData.buildMetaData()).to.be.an('object');
            });

            it('should have timestamp', function () {
                expect(FootballData.buildMetaData()).to.have.property('timestamp');
                expect(FootballData.buildMetaData({
                    'x-api-version': 'v1',
                    'x-authenticated-client': 'anonymous'
                })).to.have.property('timestamp');
            });

            describe('mock Date.now()', function () {
                let FakeTimestamp;
                let revert;

                before(function () {
                    FakeTimestamp = rewire('../src/index');
                    const dateMock = {
                        now: () => 1
                    };
                    revert = FakeTimestamp.__set__('Date', dateMock);
                });

                after(function () {
                    revert();
                });

                it('should match headers', function () {
                    expect(FakeTimestamp.buildMetaData({
                        'x-api-version': 'v1',
                        'x-authenticated-client': 'anonymous'
                    })).to.be.deep.equal({
                        timestamp: 1,
                        version: 'v1',
                        client: 'anonymous'
                    });
                });

                it('should match all headers', function () {
                    expect(FakeTimestamp.buildMetaData({
                        'x-application-context': 'production',
                        'x-response-control': 'full',
                        'x-api-version': 'v1',
                        'x-authenticated-client': 'anonymous',
                        'x-requestcounter-reset': '4057',
                        'x-requests-available': '50'
                    })).to.be.deep.equal({
                        timestamp: 1,
                        context: 'production',
                        response: 'full',
                        version: 'v1',
                        client: 'anonymous',
                        reset: 4057,
                        available: 50
                    });
                });
            });
        });

        describe('buildQueryFilters', function () {
            it('should return string', function () {
                expect(FootballData.buildQueryFilters()).to.be.a('string');
                expect(FootballData.buildQueryFilters([], {})).to.be.a('string');
                expect(FootballData.buildQueryFilters(['season'], { season: 2017 })).to.be.a('string');
            });

            it('should be empty for invalid params', function () {
                expect(FootballData.buildQueryFilters()).to.be.empty;
                expect(FootballData.buildQueryFilters(['season'])).to.be.empty;
                expect(FootballData.buildQueryFilters('season', { season: 2017 })).to.be.empty;
                expect(FootballData.buildQueryFilters(['season'], 2017)).to.be.empty;
            });

            it('should filter based on whitelist', function () {
                expect(FootballData.buildQueryFilters(['season'], {
                    season: 2017,
                    id: 7587
                })).to.be.equal('?season=2017');
                expect(FootballData.buildQueryFilters(['season'], {
                    season: 20170
                })).to.be.empty;
                expect(FootballData.buildQueryFilters(['season'], {
                    foo: 'bar'
                })).to.be.empty;
            });
        });

        describe('handleId', function () {
            it('should return id', function () {
                expect(FootballData.handleId({ id: 1 })).to.be.equal(1);
                expect(FootballData.handleId({ id: '1' })).to.be.equal('1');
                expect(FootballData.handleId({ id: 1230475 })).to.be.equal(1230475);
                expect(FootballData.handleId({ id: '1230475' })).to.be.equal('1230475');
            });

            it('should throw invalid format', function () {
                expect(FootballData.handleId.bind(FootballData)).to.throw('Invalid id format!');
                expect(FootballData.handleId.bind(FootballData, {})).to.throw('Invalid id format!');
                expect(FootballData.handleId.bind(FootballData, { id: -1 })).to.throw('Invalid id format!');
                expect(FootballData.handleId.bind(FootballData, { id: '14564e65' })).to.throw('Invalid id format!');
            });
        });
    });

    context('buildHeaders', function () {
        let FD;

        beforeEach(function () {
            FD = new FootballData();
        });

        it('should return object', function () {
            expect(FD.buildHeaders()).to.be.an('object');
            FD = new FootballData({
                auth: 'test',
                response: 'full'
            });
            expect(FD.buildHeaders()).to.be.an('object');
        });

        it('should return empty object', function () {
            expect(FD.buildHeaders()).to.be.empty;

            FD = new FootballData({
                foo: 'bar'
            });
            expect(FD.buildHeaders()).to.be.empty;
        });

        it('should return some headers', function () {
            FD = new FootballData({
                auth: 'test'
            });
            expect(FD.buildHeaders()).to.be.deep.equal({
                'X-Auth-Token': 'test'
            });

            FD = new FootballData({
                response: 'full'
            });
            expect(FD.buildHeaders()).to.be.deep.equal({
                'X-Response-Control': 'full'
            });

            FD = new FootballData({
                response: 'full',
                foo: 'bar'
            });
            expect(FD.buildHeaders()).to.be.deep.equal({
                'X-Response-Control': 'full'
            });
        });

        it('should return full headers', function () {
            FD = new FootballData({
                auth: 'test',
                response: 'full'
            });
            expect(FD.buildHeaders()).to.be.deep.equal({
                'X-Auth-Token': 'test',
                'X-Response-Control': 'full'
            });

            FD = new FootballData({
                auth: 'test',
                response: 'full',
                foo: 'bar'
            });
            expect(FD.buildHeaders()).to.be.deep.equal({
                'X-Auth-Token': 'test',
                'X-Response-Control': 'full'
            });
        });
    });

    context('buildOptions', function () {
        let FD;

        beforeEach(function () {
            FD = new FootballData();
        });

        it('should return object', function () {
            expect(FD.buildOptions()).to.be.an('object');
            FD = new FootballData({
                auth: 'test',
                response: 'full'
            });
            expect(FD.buildOptions()).to.be.an('object');
            expect(FD.buildOptions('foobar')).to.be.an('object');
        });

        it('should return basic options', function () {
            expect(FD.buildOptions('foobar')).to.be.deep.equal({
                hostname: 'api.football-data.org',
                path: '/v1/foobar',
                headers: {}
            });
        });

        it('should return options with headers', function () {
            FD = new FootballData({
                auth: 'test',
                response: 'full'
            });

            expect(FD.buildOptions('foobar')).to.be.deep.equal({
                hostname: 'api.football-data.org',
                path: '/v1/foobar',
                headers: {
                    'X-Auth-Token': 'test',
                    'X-Response-Control': 'full'
                }
            });
        });
    });

    context('get', function () {
        let FD;

        beforeEach(function () {
            FD = new FootballData();
        });

        it('should return promise', function () {
            API.get(`/${VERSION}/testtype`)
                .reply(200, { foo: 'bar' });

            expect(FD.get({
                hostname: BASEURL,
                path: `/${VERSION}/testtype`
            })).to.be.a('promise');
        });

        it('should reject promise status code 406', function () {
            API.get(`/${VERSION}/teststatus406`)
                .reply(200, '<?xml version="1.0" encoding="UTF-8"?><text><![CDATA[Hello World]]></text>', {
                    'Content-Type': 'application/xml'
                });

            return FD.get({
                hostname: BASEURL,
                path: `/${VERSION}/teststatus406`
            }).then(function () {
                throw new Error('This should have rejected the promise.');
            }, function (err) {
                expect(err.status).to.be.equal(406);
            });
        });

        it('should reject promise status code 400', function () {
            API.get(`/${VERSION}/teststatus400`)
                .reply(400, {
                    error: 'Bad Request'
                });

            return FD.get({
                hostname: BASEURL,
                path: `/${VERSION}/teststatus400`
            }).then(function () {
                throw new Error('This should have rejected the promise.');
            }, function (err) {
                expect(err).to.be.deep.equal({
                    status: 400,
                    error: 'Bad Request'
                });
            });
        });

        it('should reject promise status code 403', function () {
            API.get(`/${VERSION}/teststatus403`)
                .reply(403, {
                    error: 'Restricted Resource'
                });

            return FD.get({
                hostname: BASEURL,
                path: `/${VERSION}/teststatus403`
            }).then(function () {
                throw new Error('This should have rejected the promise.');
            }, function (err) {
                expect(err).to.be.deep.equal({
                    status: 403,
                    error: 'Restricted Resource'
                });
            });
        });

        it('should reject promise status code 404', function () {
            API.get(`/${VERSION}/teststatus404`)
                .reply(404, {
                    error: 'Not found'
                });

            return FD.get({
                hostname: BASEURL,
                path: `/${VERSION}/teststatus404`
            }).then(function () {
                throw new Error('This should have rejected the promise.');
            }, function (err) {
                expect(err).to.be.deep.equal({
                    status: 404,
                    error: 'Not found'
                });
            });
        });

        it('should reject promise status code 429', function () {
            API.get(`/${VERSION}/teststatus429`)
                .reply(429, {
                    error: 'Too Many Requests'
                });

            return FD.get({
                hostname: BASEURL,
                path: `/${VERSION}/teststatus429`
            }).then(function () {
                throw new Error('This should have rejected the promise.');
            }, function (err) {
                expect(err).to.be.deep.equal({
                    status: 429,
                    error: 'Too Many Requests'
                });
            });
        });

        it('should reject promise JSON.parse failed', function () {
            API.get(`/${VERSION}/testJSONparsefailed`)
                .reply(200, 'foobar', {
                    'Content-Type': 'application/json'
                });

            return FD.get({
                hostname: BASEURL,
                path: `/${VERSION}/testJSONparsefailed`
            }).then(function () {
                throw new Error('This should have rejected the promise.');
            }, function (err) {
                expect(err).to.be.deep.equal({
                    status: 200,
                    error: 'Parsing Failed!'
                });
            });
        });

        it('should reject promise on connection error', function () {
            API.get(`/${VERSION}/testConnectionProblem`)
                .replyWithError('Connection Problem');
            return FD.get({
                hostname: BASEURL,
                path: `/${VERSION}/testConnectionProblem`
            }).then(function () {
                throw new Error('This should have rejected the promise.');
            }, function (err) {
                expect(err).to.be.deep.equal({
                    status: 9000,
                    error: 'Connection Problem'
                });
            });
        });

        describe('successful', function () {
            const data = [
                {
                    id: 394,
                    caption: '1. Bundesliga 2015/16',
                    league: 'BL1',
                    year: '2015',
                    numberOfTeams: 18,
                    numberOfGames: 306,
                    lastUpdated: '2015-10-25T19:06:29Z'
                },
                {
                    id: 395,
                    caption: '2. Bundesliga 2015/16',
                    league: 'BL2"',
                    year: '2015',
                    numberOfTeams: 18,
                    numberOfGames: 306,
                    lastUpdated: '2015-10-25T19:06:59Z'
                }
            ];

            const headers = {
                'content-type': 'application/json;charset=UTF-8',
                'x-application-context': 'application:production',
                'x-requests-available': '98',
                'x-requestcounter-reset': '86312',
                'x-authenticated-client': 'anonymous',
                'x-api-version': 'v1',
                'x-response-control': 'full'
            };

            it('should resolve promise', function () {
                API.get(`/${VERSION}/testsuccess`)
                    .reply(200, data, headers);

                return FD.get({
                    hostname: BASEURL,
                    path: `/${VERSION}/testsuccess`
                }).then(function (res) {
                    expect(res).to.be.deep.equal({ data });
                }, function () {
                    throw new Error('This should have resolved the promise.');
                });
            });

            it('should resolve promise with meta data', function () {
                const FakeTimestamp = rewire('../src/index');
                const dateMock = {
                    now: () => 1
                };
                const revert = FakeTimestamp.__set__('Date', dateMock);

                API.get(`/${VERSION}/testsuccessmeta`)
                    .reply(200, data, headers);

                return new FakeTimestamp({
                    meta: true
                }).get({
                    hostname: BASEURL,
                    path: `/${VERSION}/testsuccessmeta`
                }).then(function (res) {
                    expect(res).to.be.deep.equal({
                        data,
                        meta: {
                            timestamp: 1,
                            context: 'application:production',
                            response: 'full',
                            version: 'v1',
                            client: 'anonymous',
                            reset: 86312,
                            available: 98
                        }
                    });
                    revert();
                }, function () {
                    throw new Error('This should have resolved the promise.');
                });
            });
        });
    });

    context('competitions', function () {
        const url = `/${VERSION}/competitions/`;
        let FD;
        let spy;

        beforeEach(function () {
            FD = new FootballData();
            API.get(url)
                .query(true)
                .reply(200, { foo: 'bar' });
            spy = sinon.spy(FD, 'get');
        });

        afterEach(function () {
            spy.restore();
        });

        it('should return promise', function () {
            expect(FD.competitions()).to.be.a('promise');
        });

        it('should set filter season 2017', function () {
            return FD.competitions({
                season: 2017
            }).then(function () {
                expect(spy.getCall(0).args[0].path).to.be.equal(`${url}?season=2017`);
            }, function () {
                throw new Error('This should have resolved the promise.');
            });
        });

        it('should set filter season 2016', function () {
            return FD.competitions({
                season: 2016,
                id: 20
            }).then(function () {
                expect(spy.getCall(0).args[0].path).to.be.equal(`${url}?season=2016`);
            }, function () {
                throw new Error('This should have resolved the promise.');
            });
        });

        it('should set no filter', function () {
            return FD.competitions({
                season: 20165,
                id: 20
            }).then(function () {
                expect(spy.getCall(0).args[0].path).to.be.equal(url);
            }, function () {
                throw new Error('This should have resolved the promise.');
            });
        });

        it('should set no filter #2', function () {
            return FD.competitions().then(function () {
                expect(spy.getCall(0).args[0].path).to.be.equal(url);
            }, function () {
                throw new Error('This should have resolved the promise.');
            });
        });
    });

    context('fixture', function () {
        const url = `/${VERSION}/fixtures/1`;
        let FD;
        let spy;

        beforeEach(function () {
            FD = new FootballData();
            API.get(url)
                .query(true)
                .reply(200, { foo: 'bar' });
            spy = sinon.spy(FD, 'get');
        });

        afterEach(function () {
            spy.restore();
        });

        it('should return promise', function () {
            expect(FD.fixture({ id: 1 })).to.be.a('promise');
        });

        it('should set filter head2head 5', function () {
            return FD.fixture({
                id: 1,
                head2head: 5
            }).then(function () {
                expect(spy.getCall(0).args[0].path).to.be.equal(`${url}?head2head=5`);
            }, function () {
                throw new Error('This should have resolved the promise.');
            });
        });

        it('should set filter head2head 15', function () {
            return FD.fixture({
                id: 1,
                head2head: 15,
                season: 2017
            }).then(function () {
                expect(spy.getCall(0).args[0].path).to.be.equal(`${url}?head2head=15`);
            }, function () {
                throw new Error('This should have resolved the promise.');
            });
        });

        it('should set no filter', function () {
            return FD.fixture({
                season: 2017,
                id: 1
            }).then(function () {
                expect(spy.getCall(0).args[0].path).to.be.equal(url);
            }, function () {
                throw new Error('This should have resolved the promise.');
            });
        });

        it('should throw invalid id', function () {
            expect(FD.fixture.bind(FD)).to.throw('Invalid id format!');
            expect(FD.fixture.bind(FD, { head2head: 5 })).to.throw('Invalid id format!');
        });
    });
});
