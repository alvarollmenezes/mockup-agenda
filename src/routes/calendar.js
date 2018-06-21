const apicache = require("apicache").options({ debug: false }).middleware;
const calendarController = require("../controllers/calendar.controller")();

module.exports = [
  {
    path: "/",
    method: "get",
    middlewares: [],
    action: calendarController.availableCalendars
  },
  {
    path: "/events",
    method: "get",
    middlewares: [apicache("60 minutes")],
    action: calendarController.events
  },
  {
    path: "/events2",
    method: "get",
    middlewares: [apicache("60 minutes")],
    action: calendarController.events2
  },
  {
    path: "/events/goves",
    method: "get",
    middlewares: [apicache("60 minutes")],
    action: calendarController.eventsGovEs
  }
];
