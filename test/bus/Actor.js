module.exports = {
	name: 'Actor',
	watch: function ( greetings, title, name, terms, ignite, callback ) {
		console.log( 'Watching >>>>>>>>>>>>', greetings, title, name )
		callback( null, 'done' )
	},
	actAsync: function ( greetings, terms, ignite, callback ) {
		console.log( 'Acting >>>>>>>>>>>>', greetings, terms )
		callback( null, 'done' )
	},
	actSync: function ( greetings, terms, ignite, callback ) {
		console.log( 'Acting >>>>>>>>>>>>', greetings, terms )
		return 'done'
	}
}
