var google = require('googleapis');
var googleAuth = require('google-auth-library');

var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

(function (gcal) {

    function authorize(key, callback) {
        var auth = new googleAuth();
        var jwtClient = new auth.JWT(key.client_email, null, key.private_key, SCOPES, null);

        jwtClient.authorize(function (err, tokens) {
            callback(err, jwtClient);
        });
    }

    gcal.listEvents = function (params, callback) {
        var cal = require('./client_secret.json')[params.agenda];

        console.log(params);

        authorize(cal.key
            , function (err, auth) {
                if (err) {
                    callback('Authentication failed because of ' + err);
                    return null;
                }

                var calendar = google.calendar('v3');

                params.auth = auth;
                params.calendarId = cal.calendarId;

                calendar.events.list(params
                    , function (err, response) {
                        if (err) {
                            callback('The API returned an error: ' + err);
                            return null;
                        }

                        callback(null, response);
                    });
            });
    }

})(module.exports);
