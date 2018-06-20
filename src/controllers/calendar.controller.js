const Promise = require( 'bluebird' );
const calendarService = require( "../services/calendar.service.js" )();

const _ = require( 'lodash' );

module.exports = () => {
    var calendarController = new Object();

    calendarController.availableCalendars = ( req, res ) => {
        return Promise.resolve( calendarService.getAvailableCalendars() )
            .then( data => res.json( data ) );
    }

    calendarController.events = ( req, res ) => {
        let params = req.query;

        return calendarService.getEvents( params )
            .then( events => res.json( events ) );
    }

    calendarController.events2 = ( req, res ) => {
        let params = req.query;

        return calendarService.getEvents2( params )
            .then( events => res.json( events ) );
    }

    calendarController.eventsGovEs = ( req, res ) => {
        const query = req.query;
        const maxResults = query.maxResults;
        req.maxResults = null; //TODO: multiplicar pelo numero de agendas

        return calendarService.getGovEsEvents( query, maxResults )
            .then( events => res.json( events ) );
    }

    return calendarController;
};
