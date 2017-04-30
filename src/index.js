'use strict';

const https = require('https');
const querystring = require('querystring');

const VERSION = 'v1';
const BASEURL = 'api.football-data.org';

class FootballData {
    constructor(options) {
        this.options = options || {};
    }

    static leagueAbbrevations() {
        return {
            BL1: '1. Bundesliga',
            BL2: '2. Bundesliga',
            BL3: '3. Bundesliga',
            DFB: 'DFB-Pokal',
            PL: 'Premiere League',
            EL1: 'League One',
            ELC: 'Championship',
            FAC: 'FA-Cup',
            SA: 'Serie A',
            SB: 'Serie B',
            PD: 'Primera Division',
            SD: 'Segunda Division',
            CDR: 'Copa del Rey',
            FL1: 'Ligue 1',
            FL2: 'Ligue 2',
            DED: 'Eredivisie',
            PPL: 'Primeira Liga',
            GSL: 'Primeira Liga',
            CL: 'Champions-League',
            EL: 'UEFA-Cup',
            EC: 'European-Cup of Nations',
            WC: 'World-Cup'
        };
    }

    static filters() {
        return {
            id: /^[0-9]+$/,
            matchday: /^[1-4]*[0-9]*$/,
            season: /^\d\d\d\d$/,
            head2head: /^[0-9]+$/,
            venue: /^away|home$/,
            league: /^[\w\d]{2,4}(,[\w\d]{2,4})*$/,
            timeFrame: /^(p|n)[1-9]{1,2}$/
        };
    }

    static options() {
        return {
            auth: /^[a-z1-9]+$/,
            response: /^(full|minified|compressed)$/
        };
    }

    static buildMetaData(headers) {
        const meta = {
            timestamp: Date.now()
        };

        if (headers && Object.prototype.hasOwnProperty.call(headers, 'x-application-context')) {
            meta.context = headers['x-application-context'];
        }
        if (headers && Object.prototype.hasOwnProperty.call(headers, 'x-response-control')) {
            meta.response = headers['x-response-control'];
        }
        if (headers && Object.prototype.hasOwnProperty.call(headers, 'x-api-version')) {
            meta.version = headers['x-api-version'];
        }
        if (headers && Object.prototype.hasOwnProperty.call(headers, 'x-authenticated-client')) {
            meta.client = headers['x-authenticated-client'];
        }
        if (headers && Object.prototype.hasOwnProperty.call(headers, 'x-requestcounter-reset')) {
            meta.reset = parseInt(headers['x-requestcounter-reset']);
        }
        if (headers && Object.prototype.hasOwnProperty.call(headers, 'x-requests-available')) {
            meta.available = parseInt(headers['x-requests-available']);
        }

        return meta;
    }

    static buildQueryFilters(whitelist, filters) {
        if (!Array.isArray(whitelist) || !(filters instanceof Object)) {
            return '';
        }

        const query = Object.assign({}, filters);

        const keys = Object.keys(query);
        keys.forEach((filter) => {
            if (whitelist.indexOf(filter) === -1 || !FootballData.filters()[filter].test(query[filter])) {
                delete query[filter];
            }
        });

        return `?${querystring.stringify(query)}`;
    }

    get(options) {
        return new Promise((resolve, reject) => {
            https.get(options, (res) => {
                const status = res.statusCode;
                const contentType = res.headers['content-type'];

                if (!/^application\/json/.test(contentType)) {
                    res.resume();
                    reject({
                        status: 406,
                        error: `Invalid content-type. Expected application/json but received ${contentType}`
                    });
                }

                res.setEncoding('utf8');
                let raw = '';
                res.on('data', (chunk) => { raw += chunk; });
                res.on('end', () => {
                    try {
                        const data = JSON.parse(raw);
                        if (status === 200) {
                            const response = { data };
                            if (this.options.meta) {
                                response.meta = FootballData.buildMetaData(res.headers);
                            }
                            resolve(response);
                        } else {
                            reject({ status, error: data.error });
                        }
                    } catch (e) {
                        reject({ status, error: e.message });
                    }
                });
            }).on('error', (e) => {
                console.error(`Got error: ${e.message}`);
            });
        });
    }

    buildHeaders() {
        const headers = {};

        if (this.options.auth && FootballData.options().auth.test(this.options.auth)) {
            headers['X-Auth-Token'] = this.options.auth;
        }
        if (this.options.response && FootballData.options().response.test(this.options.response)) {
            headers['X-Response-Control'] = this.options.response;
        }

        return headers;
    }

    buildOptions(path) {
        return {
            hostname: BASEURL,
            path: `/${VERSION}/${path}`,
            headers: this.buildHeaders()
        };
    }

    competitions(filters) {
        return this.get(
            this.buildOptions(`competitions/${FootballData.buildQueryFilters(['season'], filters)}`)
        );
    }
}

module.exports = FootballData;
