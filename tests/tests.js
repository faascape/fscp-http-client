var assert = require('assert');
var http = require('http');
var fs = require('fs');
var Client = require('../lib/simple-http-client.js').Client;

var PAYLOAD1 = "SERVER1";

describe("test http client", function () {


    var server1;
    var server2;
    var server3;
    var server4;

    before(function () {

        server1 = http.createServer(function (req, res) {
            res.end(PAYLOAD1);
        }).listen(8000, "127.0.0.1");

        server2 = http.createServer(function (req, res) {
            var content = '';
            req.on('data', function (chunk) {
                content += chunk;
            });
            req.on('end', function () {
                res.end(content);
            });
        }).listen(8001, "127.0.0.1");

        server3 = http.createServer(function (req, res) {
            var size = 0;
            req.on('data', function (chunk) {
                size += chunk.length;
            });
            req.on('end', function () {
                res.end(JSON.stringify({ size: size }));
            });
        }).listen(8002, "127.0.0.1");

        server4 = http.createServer(function (req, res) {
            res.end("teststream1");
        }).listen(8003, "127.0.0.1");



    });


    describe("GET / with endpoint", function () {
        var client = new Client("http://127.0.0.1:8000");
        it('should retrieve payload from get request', function (done1) {
            client.doGet(null, '/', function (err, res, result) {
                assert.equal(result, PAYLOAD1);
                done1();
            });
        });

    });



    describe("GET / with options", function () {
        var client = new Client({
            targetPort: 8000
        });
        it('should retrieve payload from get request', function (done1) {
            client.doGet(null, '/', function (err, res, result) {
                assert.equal(result, PAYLOAD1);
                done1();
            });
        });

    });



    describe("POST /", function () {
        var client = new Client({
            targetPort: 8001
        });
        var payload = {
            var1: "value1"
        };

        it('should respond with posted content', function (done2) {
            client.doPost(null, '/', null, payload, function (err, res, result) {
                var parsedResult = JSON.parse(result);
                assert.equal(parsedResult.var1, "value1");
                done2();
            });
        });

    });


    describe("POST / with stream", function () {
        var client = new Client({
            targetPort: 8002
        });

        it('should respond with posted content size', function (done2) {
            var stat = fs.statSync('package.json');
            var is = fs.createReadStream('package.json');
            client.doPost(null, '/', null, is, function (err, res, result) {
                var parsedResult = JSON.parse(result);
                assert.equal(parsedResult.size, stat.size);
                done2();
            });
        });

    });

    describe("GET / to stream", function () {
        var client = new Client({
            targetPort: 8003
        });

        it('should store content to file', function (done2) {
            var ws = fs.createWriteStream('teststream1');
            client.doGet2Stream(null, '/', null, ws, function (err, res, result) {
                ws.close();
                var testContent = fs.readFileSync("teststream1");
                assert.equal("teststream1", testContent);
                done2();
            });
        });

    });




    after(function () {
        server1.close();
        server2.close();
        server3.close();
    });

});