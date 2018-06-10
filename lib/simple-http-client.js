var http = require('http');
var https = require('https');
var url = require('url');
var stream = require('stream');


var DEFAULT_TARGET_HOST = '127.0.0.1';
var DEFAULT_TARGET_PROTOCOL = 'http';

var Client = exports.Client = function (options) {
    var config = {};
    if (typeof options == 'string') {
        var parsedUrl = url.parse(options);
        config.targetHost = parsedUrl.hostname;
        if (parsedUrl.port) {
            config.targetPort = parseInt(parsedUrl.port);
        }
        config.targetProtocol = parsedUrl.protocol;
    }
    else {
        config = options || {};
    }
    
    this.targetHost = config.targetHost || DEFAULT_TARGET_HOST;
    this.targetPort = config.targetPort;
    var protocol = config.targetProtocol || DEFAULT_TARGET_PROTOCOL;
    this.targetProtocol = protocol == 'http' || protocol == 'http:' ? http : https;
    this.sessionCookie = null;
    this.sessionName = config.sessionName;
};




function getCookieValue(response) {
var header = response.headers["set-cookie"];
var values = {};
  header && header[0].split(';').forEach(function( cookie ) {
    var parts = cookie.split('=');
    values[parts.shift().trim()] = decodeURI(parts.join('='));
  });

return values;


}

Client.prototype.clearSession = function() {
this.sessionName = null;
this.sessionCookie = null;
}

Client.prototype._doRequest = function (token, method, path, appHeaders, payload, writeStream, cb) {
    if (!cb) {
        cb = writeStream;
        writeStream = null;
    }
    if (!cb) {
        cb = payload;
        payload = '';
    }
    if (!cb) {
        cb = appHeaders;
        appHeaders = null;
    }

    var options = {
        host: this.targetHost,
        port: this.targetPort,
        path: path,
        method: method,
        rejectUnauthorized: false,
        headers: {
        }
    };

    if (token) {
        options.headers.authorization = 'Bearer ' + token;
        options.headers['x-token'] = token;
    }
    if (appHeaders) {
        var propertyName;
        for (propertyName in appHeaders) {
            options.headers[propertyName.toLowerCase()] = appHeaders[propertyName];
        }
    }

    if(this.sessionName && this.sessionCookie) {
      options.headers.Cookie  = this.sessionName+"="+this.sessionCookie+";";
    }

    if (payload && !options.headers['content-type']) {
        options.headers['content-type'] = 'application/json';
    }

    var result = '';
    var self = this;
    var req = this.targetProtocol.request(options, function (res) {

        var cookies = getCookieValue(res);

        if(cookies && cookies[self.sessionName]) {
          self.sessionCookie = cookies[self.sessionName];
        }


        if (writeStream) {
            res.pipe(writeStream);
        }
        else {
            res.on('data', function (chunk) {
                result += chunk;
            });
        }
        res.on('end', function () {
            cb(null, res, result);
        });

    });
    req.on('error', function (err) {
        console.log('err : ', err);
        cb(err);
    });

    if (payload instanceof stream.Readable) {
        payload.pipe(req);
    } else {
        var dataToSend = typeof payload == 'object' ? JSON.stringify(payload) : payload;
        req.end(dataToSend);
    }

};

Client.prototype.doPost = function (token, path, appHeaders, payload, cb) {
    this._doRequest(token, 'POST', path, appHeaders, payload, cb);
};

Client.prototype.doPut = function (token, path, appHeaders, payload, cb) {
    this._doRequest(token, 'PUT', path, appHeaders, payload, cb);
};

Client.prototype.doDelete = function (token, path, appHeaders, cb) {
    this._doRequest(token, 'DELETE', path, appHeaders, cb);
};

Client.prototype.doGet = function (token, path, appHeaders, cb) {
    this._doRequest(token, 'GET', path, appHeaders, cb);
};

Client.prototype.doGet2Stream = function (token, path, appHeaders, ws, cb) {
    this._doRequest(token, 'GET', path, appHeaders, '', ws, cb);
};

exports.module = Client;


