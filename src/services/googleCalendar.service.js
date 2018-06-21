const { google } = require("googleapis");
const calendarConfig = require("../config/calendar.js");

module.exports = () => {
  let gCalService = new Object();

  gCalService.listEvents = (calendarId) => {
    const calendar = google.calendar({ version: "v3" });

    const options = {
        auth: calendarConfig.apiKey,
        calendarId: calendarId
    };

    return calendar.events.list(options);
  };

  return gCalService;
};
