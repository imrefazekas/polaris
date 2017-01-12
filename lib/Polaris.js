let Assigner = require('assign.js')
let assigner = new Assigner()

let _ = require('isa.js')
let fs = require('fs')
let path = require('path')

let entities = {}, patience

function typise ( str ) {
	try {
		return JSON.parse( str )
	} catch (err) { return str }
}

function readCLI ( commands ) {
	let params = [], opts = {}, idx
	commands.forEach( (command) => {
		if (!command) return

		if ( command.startsWith('--') ) {
			let cmd = command.substring( 2 )
			if ( (idx = cmd.indexOf('=')) > 0 )
				opts[ cmd.substring( 0, idx ) ] = typise( cmd.substring( idx + 1 ) )
			else opts[ cmd ] = true
		}
		else params.push( typise( command ) )
	} )
	return { params: params, opts: opts }
}

function syncFunctions (obj) {
	let res = []
	for (let m in obj)
		if ( _.isFunction(obj[m]) )
			res.push( m )
	return res
}
function asycFunctions (obj) {
	let res = []
	for (let m in obj)
		if ( _.isAsyncFunction(obj[m]) )
			res.push( m )
	return res
}

function printUsage (name, entity, service, options) {
	if ( service && entity[ service ] ) {
		console.log( '\n', service )
		let params = _.parameterNames( entity[ service ] )
		if ( params[ params.length - 1 ] === 'callback' || params[ params.length - 1 ] === 'cb' )
			params = params.slice( 0, params.length - 1 )
		console.log( '\tUsage: $ {cli_cmd}', name + ' ' + service + ' ' + params.join(' ') )
	}
	else if ( entity ) {
		console.log( '\n\nEntity: ' + name )
		console.log( '\nServices:' )
		let fns = [].concat( syncFunctions(entity) ).concat( asycFunctions(entity) )
		fns.forEach( (fn) => {
			printUsage( name, entity, fn, options )
		} )
		console.log( '\n\n' )
	}
	else {
		console.log( (options.name || '') + ' CLI tool. ' )
		console.log( fs.readFileSync( path.join( __dirname, 'generalUsage.def'), 'utf8' ) )
		let ents = Object.keys( entities )
		console.log( 'Entities: ' + ents.join(', ') )
		ents.forEach( (ent) => {
			printUsage( ent, entities[ent], null, options )
		} )
	}
}

function exit (err, res) {
	if (patience)
		clearTimeout( patience )

	if (err) {
		console.error('The command exited with error: ', err)
		process.exit( -1 )
	} else
		console.info('The command returned with: ', res)
}

function call ( entityName, serviceName, entity, service, parameters, options ) {
	let fps = _.parameterNames( service )
	if ( parameters.length !== fps.length )
		throw new Error( 'Mind the parameter list!' + fps )

	return service.apply( entity, parameters )
}

function processMessageExternal ( entityName, serviceName, commands, options ) {
	options.performer.validateCall( entityName, serviceName, commands.params, commands.opts, (err, valid) => {
		if ( err ) exit(err)
		else if ( valid ) options.performer.performCall( entityName, serviceName, commands.params, commands.opts, exit )
		else return options.performer.printUsage( entityName, serviceName, options )
	} )
}

function processMessage ( argv, commands, options ) {
	let parameters = [].concat( commands.params ).concat( assigner.assign( commands.opts, process.env ) )

	let entity = entities[ argv[0] ]
	let service = entity ? entity[ argv[1] ] : null
	if ( !entity )
		return (options.printUsage || printUsage)( null, null, null, options )
	if ( !service || ( !_.isFunction( service ) && !_.isAsyncFunction( service ) ) )
		return (options.printUsage || printUsage)( argv[0], entity, null, options )

	if (options.timeout)
		patience = setTimeout( () => {
			console.error( 'Command did not terminated within the given timeframe' )
			process.exit( -1 )
		}, options.timeout )
	if (_.isFunction( service )) {
		parameters.push( exit )
		try {
			let res = call( argv[0], argv[1], entity, service, parameters, options )
			if (res) exit( null, res )
		} catch (err) { exit( err ) }
	}
	else
		call( argv[0], argv[1], entity, service, parameters, options )
		.then( (res) => { exit(null, res) } )
		.catch( (reason) => { exit(reason) } )
}

module.exports = function ( folder, options = {} ) {
	let argv = process.argv.slice( 2 )

	if ( argv.length < 2 )
		return (options.printUsage || printUsage)( null, null, null, options )

	let commands = readCLI( argv.slice( 2 ) )

	if ( options.performer )
		return processMessageExternal( argv[0], argv[1], commands, options )

	fs.readdir(folder, function (err, files) {
		if (err) return console.error( err )

		let extension = '.js'
		let matcher = options.matcher || ( options.pattern ? function (filePath) { return options.pattern.test(filePath) } : function (filePath) { return filePath.endsWith( extension ) } )

		for (let i = 0; i < files.length; i += 1)
			if ( matcher(files[i]) ) {
				let name = files[i].substring( 0, files[i].length - 3 )
				let component = require( folder + path.sep + name )
				entities[ component.name || name ] = component
			}

		if ( Object.keys( entities ).length === 0 )
			throw new Error('Service object must be passed')

		processMessage( argv, commands, options )
	} )
}
