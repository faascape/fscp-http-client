var assert = require('assert');
var http = require('http');
var Client = require('../simple-http-client.js').Client;

var PAYLOAD1 = "SERVER1";

describe("test http client", function() {
	
	
	var server1;
	var server2;
	
	before(function() {
		server1 = http.createServer(function(req, res) {
			res.end(PAYLOAD1);
		}).listen(8000, "127.0.0.1");
		server2 = http.createServer(function(req, res) {
			var content = '';
			req.on('data', function(chunk) {
				content += chunk;
			});
			req.on('end', function() {
				res.end(content);	
			})
			
		}).listen(8001, "127.0.0.1");});
	
	
	describe("GET /", function() {
		var client = new Client({
			targetPort:8000
		});
		it('should retrieve payload from get request', function(done1) {
			client.doGet(null, '/', function(err, res, result) {
				assert.equal(result, PAYLOAD1);
				done1();
			});			
		});

	});
	
	
	describe("POST /", function() {
		var client = new Client({
			targetPort:8001
		});
		var payload = {
			var1:"value1"
		};
		
		it('should respond with posted content', function(done2) {
			client.doPost(null, '/', null, payload, function(err, res, result) {
				var parsedResult = JSON.parse(result);
				assert.equal(parsedResult.var1, "value1");
				done2();
			});			
		});

	});
	
	
	
	after(function() {
		server1.close();
		server2.close();});
	
})