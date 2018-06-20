const google = require( 'googleapis' );
const Promise = require( 'bluebird' );
const calendarConfig = require( '../config/calendar.js' );

module.exports = () => {

    let gCalService = new Object();

    gCalService.listEvents = ( calendarId, params ) => {
        const calendar = google.calendar( 'v3' );

        params.auth = calendarConfig.apiKey;
        params.calendarId = calendarId;

        return new Promise( ( resolve, reject ) => {
            calendar.events.list( params,
                ( err, response ) => {
                    if ( err ) {
                        return reject( 'The API returned an error: ' + err );
                    }

                    return resolve( response );
                } );
        } );
    }

    return gCalService;
};
