module.exports = {
	name: 'Actor',
	watch: function ( greetings, title, name, opts, callback ) {
		console.log( 'Watching >>>>>>>>>>>>', greetings, title, name )
		return 'done'
	},
	actAsync: function ( greetings, opts, callback ) {
		console.log( 'Acting >>>>>>>>>>>>', greetings, opts )
		callback( null, 'done' )
	},
	actSync: function ( greetings, opts, callback ) {
		console.log( 'Acting >>>>>>>>>>>>', greetings, opts )
		return 'done'
	},
	actAwait: async function ( greetings, opts ) {
		console.log( 'Acting >>>>>>>>>>>>', greetings, opts )
		return new Promise( ( resolve, reject ) => {
			resolve( 'done' )
		} )
	}
}
