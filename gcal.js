var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

(function (gcal) {

    function authorize(key, callback) {
        var auth = new googleAuth();
        var jwtClient = new auth.JWT(key.client_email, null, key.private_key, SCOPES, null);

        jwtClient.authorize(function (err, tokens) {
            callback(err, jwtClient);
        });
    }

    gcal.listEvents = function (calendarName, callback) {
        var cal = require('./client_secret.json')[calendarName];

        authorize(cal.key
            , function (err, auth) {
                if (err) {
                    console.log('Authentication failed because of ', err);
                    return;
                }

                var calendar = google.calendar('v3');

                calendar.events.list({
                    auth: auth,
                    calendarId: cal.calendarId,
                    timeMin: (new Date(1990, 01, 01)).toISOString(),
                    maxResults: 10,
                    singleEvents: true,
                    orderBy: 'startTime'
                }, function (err, response) {
                    if (err) {
                        console.log('The API returned an error: ' + err);
                        return;
                    }

                    callback(response.items);
                });
            });
    }
})(module.exports);
