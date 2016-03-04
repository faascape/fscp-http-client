var http = require('http');
var https = require('https');
var url = require('url');
var stream = require('stream');


var DEFAULT_TARGET_HOST = '127.0.0.1';
var DEFAULT_TARGET_PORT = 80;
var DEFAULT_TARGET_PROTOCOL = 'http';

var Client = exports.Client = function(options){
  var config = {};
  if(typeof options == 'string') {
      var parsedUrl = url.parse(options);
      config.targetHost = parsedUrl.hostname;
      if(parsedUrl.port) {
        config.targetPort = parseInt(parsedUrl.port);
      }
      config.targetProtocol = parsedUrl.protocol;
  }
  else {
    config = options || { };
  }
  this.targetHost =  config.targetHost|| DEFAULT_TARGET_HOST;
  this.targetPort =  config.targetPort|| DEFAULT_TARGET_PORT;
  var protocol = config.targetProtocol || DEFAULT_TARGET_PROTOCOL;
  this.targetProtocol = protocol == 'http'|| protocol == 'http:' ? http : https;
};

Client.prototype._doRequest = function(token, method, path, appHeaders, payload, cb) {
  if(!cb) {
    cb = payload;
    payload = '';
  }
  if(!cb) {
    cb = appHeaders;
    appHeaders = null;
  }
  
  var options = {
    host:this.targetHost,
    port:this.targetPort,
    path:path,
    method:method,
    rejectUnauthorized:false,
    headers:{
    }
  };

  if(token) {
    options.headers['Authorization'] = 'Bearer '+token;
  }
  if(appHeaders) {
    var propertyName;
    for(propertyName in appHeaders) {
      options.headers[propertyName] = appHeaders[propertyName];
    }
  }

  
  if(payload && !options.headers['Content-Type']) {
    options.headers[ 'Content-Type'] = 'application/json';
  }

  var result = '';
  var req = this.targetProtocol.request(options, function(res) {
    res.on('data', function(chunk) {
      result += chunk;
    });
    res.on('end', function() {
      cb(null, res, result);
    });
  });
  req.on('error', function(err) {
    console.log('err : ', err);
    cb(err);
  });
  
  if(payload instanceof stream.Readable) {
      req.pipe(payload);
  } else {
    var dataToSend = typeof payload == 'object' ? JSON.stringify(payload) :
    req.end(dataToSend);    
  }

};

Client.prototype.doPost = function(token, path, appHeaders, payload, cb) {
  this._doRequest(token, 'POST', path, appHeaders, payload, cb);
};

Client.prototype.doPut = function(token, path, appHeaders, payload, cb) {
  this._doRequest(token, 'PUT', path, appHeaders, payload, cb);
};

Client.prototype.doDelete = function(token, path, appHeaders, cb) {
  this._doRequest(token, 'DELETE', path, appHeaders, cb);
};

Client.prototype.doGet = function(token, path, appHeaders, cb) {
  this._doRequest(token, 'GET', path, appHeaders, cb);
};

exports.module = Client;


