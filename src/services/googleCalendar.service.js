const { google } = require("googleapis");
const calendarConfig = require("../config/calendar.js");

module.exports = () => {
  let gCalService = new Object();

  gCalService.listEvents = (calendarId, params) => {
    const calendar = google.calendar({ version: "v3" });

    params.auth = calendarConfig.apiKey;
    params.calendarId = calendarId;

    return calendar.events.list(params);
  };

  return gCalService;
};
