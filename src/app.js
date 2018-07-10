const express = require( "express" );
const apiMiddleware = require( 'node-mw-api-prodest' ).middleware;
const morgan = require( 'morgan' );
const bodyParser = require( 'body-parser' );
const config = require( "./config/config.js" );
const AppRoutes = require( "./routes/calendar.js" );

let app = express();

app.use( morgan( 'dev' ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );

app.use( apiMiddleware( {
    cors: true,
    compress: true,
    log: false // TODO: middeware log com unhandled exception
} ) );

const baseRouter = express.Router();

// register all application routes
app.use( config.path, baseRouter );

AppRoutes.forEach( route => {
    baseRouter[ route.method ]( route.path, route.middlewares, ( request, response, next ) => {
        route.action( request, response, next )
            .then( () => next )
            .catch( err => next( err ) );
    } );
} );

baseRouter.get( '/ping', ( req, res ) => {
    res.send( { 'result': 'version 1.1.2' } )
} );

app.use( ( err, req, res, next ) => {
    const status = err.status || 500;
    res.status( status );

    console.error( err );

    res.json( {
        status: status,
        errors: err.errors || err.message,
        message: err.userMessage,
        handled: err.handled || false,
        stack: config.production ? undefined : err.stack
    } );
} );

// Launch server
app.listen( config.port );

console.log( 'Listening on port ' + config.port );
