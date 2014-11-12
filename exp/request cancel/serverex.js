var http = require('http');
var url = require('url');
http.createServer(function (req, res) {
    var u = url.parse(req.url, true);
    setTimeout(function() {
        res.writeHead(200, {
        	'Content-Type': 'application/json',
	        'Access-Control-Allow-Origin': 'http://localhost:8080',
	        'Access-Control-Allow-Credentials': true
        });
        res.end('{"complete": true}');
    }, parseInt(u.query.value));
}).listen(1337, "127.0.0.1");
console.log('Use http://127.0.0.1:1337/?value=1000 to get answer after 1 sec delay.');