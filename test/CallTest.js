let Polaris = require('../lib/Polaris')

let path = require('path')
let _ = require('isa.js')

let Clerobee = require('clerobee')
let clerobee = new Clerobee(16)

let Harcon = require('harcon')
let inflicter, polaris

let Logger = require('./PinoLogger')
let logger = Logger.createPinoLogger( { level: 'info' } )

let priviledged = [ 'FireBender', 'Inflicter', 'Mortar' ]

let performer = {
	printUsage: function ( entityName, serviceName, options ) {
		inflicter.entities( '', (err, entities) => {
			if (err) return console.error(err)

			console.log( (options.name || '') + ' CLI tool. ' )
			let dEnts = entities.filter( (entity) => { return entity.division === inflicter.name && !priviledged.includes( entity.name ) } )
			console.log( 'Entities: ' + dEnts.map( (entity) => { return entity.name } ).join(', ') )

			dEnts.forEach( (entity) => {
				console.log( '\n\nEntity: ' + entity.name )
				console.log( '\nServices:' )

				entity.events.forEach( (service) => {
					console.log( '\n', service )
					console.log( '\tUsage: $ {cli_cmd}', entity.name + ' ' + service + ' params' )
				} )
			} )
		} )
	},
	validateCall: function ( entityName, serviceName, params, opts, callback ) {
		inflicter.firestarter( entityName, (err, fs) => {
			callback( err, fs && fs.services().includes( serviceName ) )
		} )
	},
	performCall: function ( entityName, serviceName, params, opts, callback ) {
		let id = clerobee.generate()
		polaris.addTerms( id, opts )
		let parameters = [ id, null, '', entityName + '.' + serviceName ].concat( params )
		parameters.push( callback )
		return polaris.ignite.apply( polaris, parameters )
	}
}

function addPolarisEntity ( inflicter, callback ) {
	inflicter.addicts( {
		name: 'Polaris',
		auditor: true,
		context: 'Inflicter',
		division: inflicter.division,
		inflicter: inflicter
	}, {}, function ( err, res ) {
		if ( err ) return callback( err )

		polaris = inflicter.barrel.firestarter( res.name )

		callback( null, polaris )
	} )
}

new Harcon( {
	name: 'Polaris',
	logger: logger,
	idLength: 32,
	mortar: { enabled: true, folder: path.join( __dirname, 'bus' ), liveReload: false }
} )
.then( function (_inflicter) {
	inflicter = _inflicter

	console.log('!!! Harcon is ready...')

	addPolarisEntity( _inflicter, (err) => {
		if (err) return console.error(err)

		console.log('!!! Polaris is ready...')
		setTimeout( () => {
			Polaris( path.join( __dirname, 'bus' ), {
				performer: performer
			} )
		}, 2000 )
	} )
} )
