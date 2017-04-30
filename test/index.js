'use strict';

const FootballData = require('../src/index');
const expect = require('chai').expect;
const rewire = require('rewire');

/* global describe context it before after beforeEach */
/* eslint-disable prefer-arrow-callback, no-unused-expressions, func-names, no-underscore-dangle */

describe('FootballData', function () {
    context('constructor', function () {
        it('should set parameter as options', function () {
            const options = { auth: 'test' };
            const FD = new FootballData(options);
            expect(FD.options).to.be.deep.equal(options);
        });

        it('should set default options', function () {
            const FD = new FootballData();
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

            it('should have 7 keys', function () {
                expect(Object.keys(FootballData.filters()).length).to.be.equal(7);
            });

            it('should match filter keys', function () {
                expect(FootballData.filters()).to.have.all.keys(
                    'id', 'matchday', 'season', 'head2head', 'venue', 'league', 'timeFrame'
                );
            });

            describe('id', function () {
                it(`should match ${/^[0-9]+$/.toString()}`, function () {
                    const id = FootballData.filters().id;
                    expect(436287).to.match(id);
                    expect(0).to.match(id);
                    expect(-1).to.not.match(id);
                    expect('foo23234').to.not.match(id);
                    expect('23bar').to.not.match(id);
                });
            });

            describe('matchday', function () {
                it(`should match ${/^[1-4]*[0-9]*$/.toString()}`, function () {
                    const matchday = FootballData.filters().matchday;
                    expect(436287).to.match(matchday);
                    expect(0).to.match(matchday);
                    expect(54).to.match(matchday);
                    expect(-1).to.not.match(matchday);
                    expect('foo23234').to.not.match(matchday);
                    expect('23bar').to.not.match(matchday);
                });
            });

            describe('season', function () {
                it(`should match ${/^\d\d\d\d$/.toString()}`, function () {
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
            });

            describe('head2head', function () {
                it(`should match ${/^[0-9]+$/.toString()}`, function () {
                    const head2head = FootballData.filters().head2head;
                    expect(436287).to.match(head2head);
                    expect(0).to.match(head2head);
                    expect(-1).to.not.match(head2head);
                    expect('foo23234').to.not.match(head2head);
                    expect('23bar').to.not.match(head2head);
                });
            });

            describe('venue', function () {
                it(`should match ${/^(away|home)$/.toString()}`, function () {
                    const venue = FootballData.filters().venue;
                    expect('away').to.match(venue);
                    expect('home').to.match(venue);
                    expect(436287).to.not.match(venue);
                    expect(0).to.not.match(venue);
                    expect(-1).to.not.match(venue);
                    expect('foo23home234').to.not.match(venue);
                    expect('23bar').to.not.match(venue);
                });
            });

            describe('league', function () {
                it(`should match ${/^[\w\d]{2,4}(,[\w\d]{2,4})*$/.toString()}`, function () {
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
            });

            describe('timeFrame', function () {
                it(`should match ${/^(p|n)[1-9]{1,2}$/.toString()}`, function () {
                    const timeFrame = FootballData.filters().timeFrame;
                    expect('p5').to.match(timeFrame);
                    expect('n14').to.match(timeFrame);
                    /**
                     * FIXME: this should be true, but the regex doesnt allow 0 as second digit.
                     */
                    expect('n10').to.not.match(timeFrame);
                    expect('p145').to.not.match(timeFrame);
                    expect('p').to.not.match(timeFrame);
                    expect(436287).to.not.match(timeFrame);
                    expect(0).to.not.match(timeFrame);
                    expect(-1).to.not.match(timeFrame);
                    expect('foo23home234').to.not.match(timeFrame);
                    expect('23bar').to.not.match(timeFrame);
                });
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

            describe('auth', function () {
                it(`should match ${/^[a-z1-9]+$/.toString()}`, function () {
                    const auth = FootballData.options().auth;
                    expect('foo23234').to.match(auth);
                    expect('23bar').to.match(auth);
                    expect('foobar').to.match(auth);
                    expect(436287).to.match(auth);
                    /**
                     * FIXME: this should be true, but the regex doesn't allow 0 as digit.
                     */
                    expect('foo0bar').to.not.match(auth);
                    /**
                     * FIXME: this should be true, but the regex doesn't allow 0 as digit.
                     */
                    expect(0).to.not.match(auth);
                    expect('fooXbar').to.not.match(auth);
                    expect(-1).to.not.match(auth);
                });
            });

            describe('response', function () {
                it(`should match ${/^(full|minified|compressed)$/.toString()}`, function () {
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
                let fakeTimestamp;
                let revert;

                before(function () {
                    fakeTimestamp = rewire('../src/index');
                    const dateMock = {
                        now: () => 1
                    };
                    revert = fakeTimestamp.__set__('Date', dateMock);
                });

                after(function () {
                    revert();
                });

                it('should match headers', function () {
                    expect(fakeTimestamp.buildMetaData({
                        'x-api-version': 'v1',
                        'x-authenticated-client': 'anonymous'
                    })).to.be.deep.equal({
                        timestamp: 1,
                        version: 'v1',
                        client: 'anonymous'
                    });
                });

                it('should match all headers', function () {
                    expect(fakeTimestamp.buildMetaData({
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
                })).to.be.equal('?');
                expect(FootballData.buildQueryFilters(['season'], {
                    foo: 'bar'
                })).to.be.equal('?');
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

    context.skip('get');

    context.skip('competitions');
});
