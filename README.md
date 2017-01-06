Polaris - simple CLI generator for CommonJS objects

[![NPM](https://nodei.co/npm/polaris.png)](https://nodei.co/npm/polaris/)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

========

[polaris](https://github.com/imrefazekas/polaris) is a small library to facilitate the development of CLI tools.
The main concept is to use pure CommonJS objects to define the services and map them to a CLI syntax to be called.
As a reflective service, [polaris](https://github.com/imrefazekas/polaris) will print out usage information for all services of all/related entities in case of malformed or incomplete call.

My goal was to able to use my existing business objects serving as microservices with [harcon](https://github.com/imrefazekas/harcon) or as REST endpoints with [connect-rest](https://github.com/imrefazekas/connect-rest) and [harcon-radiation](https://github.com/imrefazekas/harcon-radiation) as _CLI solution_.
Clean and pure CommonJS objects defined once and used everywhere, for all interfaces / protocols.

[Usage](#usage)

[Call](#call)

[Customize](#customize)



## Usage

Command line:

```javascript
npm install polaris.js --save
```

Create a subfolder in your working folder

```javascript
mkdir bus
```

Copy your CommonJS objects to that folder...

In package.json code:

```javascript
"bin": {
	"YOUR_CLI_NAME_HERE": "YOUR_SCRIPT_HERE"
}
```

In you script:

```javascript
let Polaris = require('polaris.js')

let path = require('path')

Polaris( path.join( __dirname, 'bus' ) )
```

And you are ready to go, npm will do the rest...


## Call

All CommonJS objects in your _"bus"_ folder will be available throught its name determined the "name" property of the object or the name of the file.
All functions and await functions will be exposed automatically.

Syntax of the calls:

$ {your_CLI_name} {entity_name} {service_name} parameter1 [... parameterN] --opt_name=opt_value

Let's have a single object, Smith.js in the bus folder:

```javascript
module.exports = {
	name: 'Smith',
	act: fuction ( action, opts ) {
		return 'done'
	},
	investigate: fuction ( event, timestamp, opts, callback ) {
		callback( null, 'done' )		
	},
	seek: await fuction ( title, name, opts ) {
		return new Promise( (resolve, reject) => {
			resolve('done')
		} )	
	}
}
```

One has 3 options to define a service:
- sync function
- async function with a callback at the end of the parameter list
- await function returning with a promise

All types might receive parameters from the CLI line and will receive an "opts" object enclosing options and environment variables.

Let's call these functions:

```javascript
$ {your_CLI_name} Smith act sleep

$ {your_CLI_name} Smith investigate breach today

$ {your_CLI_name} Smith seek Mr. Neo
```

Entity and service names are case sentitive, parameters will by passed typised.

In case of any error thrown or occurred, [polaris](https://github.com/imrefazekas/polaris) will print out the error and terminates the execution.

__!Note__: please keep in mind, that await functions require Node 7+



###### The opts object:

The opts object will contain all environment variables and all Y definitions pass to the CLI.
It serves contextual / environmental parametrising and is created on-the-fly by [polaris](https://github.com/imrefazekas/polaris) as follows:

```javascript
$ {your_CLI_name} Smith seek Mr. Neo --seek_mode=silent --varbose
```

That will make [polaris](https://github.com/imrefazekas/polaris) to perform the following call of the function "seek"

```javascript
seek: await fuction ( title, name, opts )
...
seek( 'Mr.', 'Neo', { 'seek_mode': 'silent', 'verbose': true, ... with the existing environment variables } )
```


## Customize

[polaris](https://github.com/imrefazekas/polaris) accepts a path when it is created and an optional object enclosign refinements of its behaviour as foloows:

- name: name of the CLI tool itself, must be equal to the name defined in the _"bin"_ attribute of _package.json_
- timeout: if set, the execution will be halted within the given timeframe expressed in seconds
- matcher: a function to determine which file should be required as an entity
- pattern: the pattern object to define which file should be required as an entity
- printUsage: custom function to print out usage information by the following signature
	printUsage( name, entityObject, serviceFn, options )



## License

(The MIT License)

Copyright (c) 2017 Imre Fazekas

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


## Bugs

See <https://github.com/imrefazekas/polaris/issues>.
