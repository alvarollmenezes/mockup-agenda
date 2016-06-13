var google = require('googleapis');
var googleAuth = require('google-auth-library');
var Promise = require("bluebird");

var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

(function (gcal) {

    function authorize(key, callback) {
        var auth = new googleAuth();
        var jwtClient = new auth.JWT(key.client_email, null, key.private_key, SCOPES, null);

        jwtClient.authorize(function (err, tokens) {
            callback(err, jwtClient);
        });
    }

    gcal.listEvents = function (key, calendarId, params) {
        return new Promise(function (resolve, reject) {
            authorize(key
                , function (err, auth) {
                    if (err) {
                        return reject('Authentication failed because of ' + err);
                    }

                    var calendar = google.calendar('v3');

                    params.auth = auth;
                    params.calendarId = calendarId;

                    calendar.events.list(params
                        , function (err, response) {
                            if (err) {
                                return reject('The API returned an error: ' + err);
                            }

                            return resolve(response);
                        });
                });
        });
    }

})(module.exports);
