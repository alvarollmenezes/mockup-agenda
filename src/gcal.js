const google = require('googleapis');
const Promise = require('bluebird');
const config = require('./config.js');

(function (gcal) {

    gcal.listEvents = function ( calendarId, params ) {
        const calendar = google.calendar( 'v3' );

        params.auth = config.apiKey;
        params.calendarId = calendarId;

        return new Promise( ( resolve, reject ) => {
            calendar.events.list( params,
                function ( err, response ) {
                    if (err) {
                        return reject( 'The API returned an error: ' + err );
                    }

                    return resolve( response );
                });
        });
    }

})(module.exports);
