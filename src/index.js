'use strict';

/**
 * @file index.js
 *
 * @author fewieden
 * @license MIT
 *
 * @see  https://github.com/fewieden/node-football-data-api
 */

/**
 * @external https
 * @see https://nodejs.org/api/https.html
 */
const https = require('https');

/**
 * @external querystring
 * @see https://nodejs.org/api/querystring.html
 */
const querystring = require('querystring');

/**
 * API version that's beeing used.
 * @const
 * @type {string}
 */
const VERSION = 'v1';

/**
 * Base url of the API.
 * @const
 * @type {string}
 */
const BASEURL = 'api.football-data.org';

/**
 * All request headers.
 * @const
 * @type {Object.<string, string>}
 */
const HEADERS = {
    auth: 'X-Auth-Token',
    response: 'X-Response-Control'
};

/**
 * All response headers.
 * @const
 * @type {Object.<string, string>}
 */
const METADATA = {
    context: 'x-application-context',
    response: 'x-response-control',
    version: 'x-api-version',
    client: 'x-authenticated-client',
    reset: 'x-requestcounter-reset',
    available: 'x-requests-available'
};

/**
 * Class representing the football-data API.
 *
 * @requires external:https
 * @requires external:querystring
 */
class FootballData {
    /**
     * Constructor for FootballData class.
     *
     * @param {Object=} params - Parameters for FootballData.
     * @param {string=} params.auth - Option to use API key to allow more requests.
     * @param {boolean=} params.meta - Option to return meta data with response.
     */
    constructor(params) {
        /**
         * @default {}
         */
        this.options = {};

        if (params !== null && typeof params === 'object') {
            if (Object.prototype.hasOwnProperty.call(params, 'auth') && FootballData.options().auth.test(params.auth)) {
                this.options.auth = params.auth;
            }

            if (Object.prototype.hasOwnProperty.call(params, 'response') && FootballData.options().response.test(params.response)) {
                this.options.response = params.response;
            }

            if (Object.prototype.hasOwnProperty.call(params, 'meta') && typeof params.meta === 'boolean') {
                this.options.meta = params.meta;
            }
        }
    }

    /**
     * Returns all available league abbrevations and their corresponding names.
     *
     * @returns {Object.<string, string>} Keys are the abbrevations and values represent their name.
     */
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

    /**
     * Returns all available filters for data querys.
     *
     * @returns {Object.<string, RegExp>} Keys are the filter names and values represent their valid regular expression.
     */
    static filters() {
        return {
            id: /^[0-9]+$/,
            matchday: /^[1-4]*[0-9]*$/,
            season: /^\d\d\d\d$/,
            head2head: /^[0-9]+$/,
            venue: /^away|home$/,
            league: /^[\w\d]{2,4}(,[\w\d]{2,4})*$/,
            timeFrame: /^(p|n)[1-9][0-9]?$/,
            timeFrameStart: /^\d\d\d\d-\d\d-\d\d$/,
            timeFrameEnd: /^\d\d\d\d-\d\d-\d\d$/
        };
    }

    /**
     * Returns all available class options.
     *
     * @returns {Object.<string, RegExp>} Keys are the option names and values represent their valid regular expression.
     */
    static options() {
        return {
            auth: /^[a-z0-9]+$/,
            response: /^(full|minified|compressed)$/
        };
    }

    /**
     * Builds response meta data based on response headers.
     *
     * @param {Object.<string, string>} headers - Response headers
     * @returns {Object.<string, string|int>} Contains at least request timestamp.
     *
     * @example Headers
     * {
     *   'x-application-context': 'production',
     *   'x-response-control': 'full',
     *   'x-api-version': 'v1',
     *   'x-authenticated-client': 'anonymous',
     *   'x-requestcounter-reset': '4057',
     *   'x-requests-available': '50'
     * }
     *
     * @example Return
     * {
     *   timestamp: 1,
     *   context: 'production',
     *   response: 'full',
     *   version: 'v1',
     *   client: 'anonymous',
     *   reset: 4057,
     *   available: 50
     * }
     */
    static buildMetaData(headers) {
        const meta = {
            timestamp: Date.now()
        };
        if (headers) {
            const keys = Object.keys(METADATA);
            keys.forEach((type) => {
                if (Object.prototype.hasOwnProperty.call(headers, METADATA[type])) {
                    if (isNaN(headers[METADATA[type]])) {
                        meta[type] = headers[METADATA[type]];
                    } else {
                        meta[type] = parseInt(headers[METADATA[type]]);
                    }
                }
            });
        }

        return meta;
    }

    /**
     * Builds querystring filter based on whitelist.
     *
     * @param {string[]} whitelist - Allowed filter parameter.
     * @param {Object.<string, *>} filters - Query filter
     * @returns {string} Querystring or empty string if filter doesn't match the criteria.
     *
     * @example Whitelist
     * ['season']
     *
     * @example Filters
     * {
     *   season: 2017
     * }
     *
     * @example Return
     * '?season=2017'
     */
    static buildQueryFilters(whitelist, filters) {
        if (!Array.isArray(whitelist) || !(filters instanceof Object)) {
            return '';
        }

        const queryObject = Object.assign({}, filters);

        const keys = Object.keys(queryObject);
        keys.forEach((filter) => {
            if (whitelist.indexOf(filter) === -1 || !FootballData.filters()[filter].test(queryObject[filter])) {
                delete queryObject[filter];
            }
        });

        const query = querystring.stringify(queryObject);

        return query.length >= 1 ? `?${query}` : '';
    }

    /**
     * Performs https get request API call.
     *
     * @param {Object} options - Https request options
     * @returns {Promise} Rejects on error with error object.
     * Resolves on success data.
     *
     * @example Options
     * {
     *   hostname: 'api.football-data.org',
     *   path: '/v1/competitions/',
     *   headers: {
     *     'X-Auth-Token': 'YOUR_API_KEY',
     *     'X-Response-Control': 'full'
     *   }
     * }
     *
     * @example Rejecting
     * {
     *   status: 400,
     *   error: 'Bad Request'
     * }
     *
     * @example Resolving
     * {
     *   data: [
     *     {
     *       id: 394,
     *       caption: '1. Bundesliga 2015/16',
     *       league: 'BL1',
     *       year: '2015',
     *       numberOfTeams: 18,
     *       numberOfGames: 306,
     *       lastUpdated: '2015-10-25T19:06:29Z'
     *     },
     *     {
     *       id: 395,
     *       caption: '2. Bundesliga 2015/16',
     *       league: 'BL2"',
     *       year: '2015',
     *       numberOfTeams: 18,
     *       numberOfGames: 306,
     *       lastUpdated: '2015-10-25T19:06:59Z'
     *     },
     *     ...
     *   ]
     * }
     */
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
                        reject({ status, error: 'Parsing Failed!' });
                    }
                });
            }).on('error', (e) => {
                reject({ status: 9000, error: e.message });
            });
        });
    }

    /**
     * Builds https request headers.
     *
     * @returns {Object.<string, string>}
     *
     * @example Return
     * {
     *   'X-Auth-Token': 'YOUR_API_KEY',
     *   'X-Response-Control': 'full'
     * }
     */
    buildHeaders() {
        const headers = {};

        const keys = Object.keys(HEADERS);
        keys.forEach((type) => {
            if (this.options[type] && FootballData.options()[type].test(this.options[type])) {
                headers[HEADERS[type]] = this.options[type];
            }
        });

        return headers;
    }

    /**
     * Builds https request options.
     *
     * @param {string} route - API route
     * @returns {{hostname: string, path: string, headers: Object.<string, string>}}
     *
     * @example Route
     * 'competitions/'
     *
     * @example Return
     * {
     *   hostname: 'api.football-data.org',
     *   path: '/v1/competitions/',
     *   headers: {
     *     'X-Auth-Token': 'YOUR_API_KEY',
     *     'X-Response-Control': 'full'
     *   }
     * }
     */
    buildOptions(route) {
        return {
            hostname: BASEURL,
            path: `/${VERSION}/${route}`,
            headers: this.buildHeaders()
        };
    }

    /**
     * Shorthand function for get() on competitions route /v1/competitions/.
     * @param {Object.<string, *>} filters - Query filter
     * @returns {Promise} Returns get() response.
     */
    competitions(filters) {
        return this.get(
            this.buildOptions(`competitions/${FootballData.buildQueryFilters(['season'], filters)}`)
        );
    }
}

module.exports = FootballData;
