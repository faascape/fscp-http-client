# fscp-http-client : a simple http client

## Description

This module is a small wrapper around node http / https client API. 
It has been written to simplify web api unit tests coding.

## Usage


### GET url

``` javascript

var Client = require('fscp-http-client').Client;

var myClient = new Client('www.google.com');

myClient.doGet(null, '/', function(err, res, result) {
	console.log(result);
});

```

### GET url with options

``` javascript

var Client = require('fscp-http-client').Client;

var myClient = new Client({
	targetHost:'www.mybeautifulsite.net',
	targetPort:8080,
	targetProtocol:'https'
});

myClient.doGet(null, '/', function(err, res, result) {
	console.log(result);
});

```


### GET url with token authentication

``` javascript

var Client = require('fscp-http-client').Client;

var myClient = new Client('www.siteusingtoken.net');


myClient.doGet('MY-TOKEN', '/', function(err, res, result) {
	console.log(result);
});
```

### POST some data

``` javascript

var Client = require('fscp-http-client').Client;

var myClient = new Client('www.siteusingtoken.net');

var payload = {
	attr1:'value1',
	attr2:'value2'
};

// default content type is application/json
// javascript object payload are stringified
 
myClient.doPost('MY-TOKEN', '/', null, payload, function(err, res, result) {
	console.log(result);
});

```

### POST some data and add some headers

``` javascript

var Client = require('fscp-http-client').Client;

var myClient = new Client('www.siteusingtoken.net');

var payload = {
	attr1:'value1',
	attr2:'value2'
};

 
myClient.doPost('MY-TOKEN', '/', { 'Accept':'application/json' }, payload, function(err, res, result) {
	console.log(result);
});

```

### POST some data from stream

``` javascript

var fs = require('fs');
var Client = require('fscp-http-client').Client;

var myClient = new Client('https://www.site.net:444');

var is = fs.createReadStream('my-file');
 
myClient.doPost('MY-TOKEN', '/', null, is, function(err, res, result) {
	console.log(result);
});

```

## pipe GET request result to stream

``` javascript

var fs = require('fs');
var Client = require('fscp-http-client').Client;

var myClient = new Client('https://www.site.net:444');

var ws = fs.createWriteStream('my-file-file');
 
myClient.doGet2Stream('MY-TOKEN', '/', ws, function(err, res, result) {
	console.log(result);
});

```

