const config = require('./config');
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const httpServer = http.createServer(function(req,res){
  const trimmedPath = url.parse(req.url,true).pathname.replace(/^\/|\/+$/g,'');
  const queryStringObject = url.parse(req.url,true).query;
  const headers = req.headers;
  const method = req.method.toLowerCase();
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', function(data){
    buffer += decoder.write(data);
  });
  req.on('end', function(){
    buffer += decoder.end();
    const chosenHandler = (method == 'post' && trimmedPath == 'hello') ? router[trimmedPath]:router['notFound'];
    const data = {
      'trimmedPath':trimmedPath,
      'queryStringObject':queryStringObject,
      'method':method,
      'header':headers,
      'payload':buffer
    }
    chosenHandler(data,function(statusCode,payload){
      statusCode = typeof(statusCode) == 'number' ? statusCode : 404;
      payload = typeof(payload) == 'object' ? payload : {};
      res.setHeader('Content-Type','application/json');
      res.writeHead(statusCode);
      res.end(JSON.stringify(payload));
      console.log('Request is received on the',trimmedPath!==''?trimmedPath:'root','route, with the',method.toUpperCase(),'method and with these query string params: ',queryStringObject);
      console.log('The headers are: ',headers);
    });
  });
});

httpServer.listen(config.port,()=>{
  console.log("The "+config.envName+" server is listening on port "+config.port+" now");
});

const handlers = {};
handlers.hello = function(data,callback){
  const payload = {
    'welcomeMessage': 'Greetings and felicitations!',
    'payload':data.payload
  }
  callback(200,payload);
}
handlers.notFound = function(data,callback){
  const payload = {
    'errorMessage': 'No route matching the url path found',
    'payload':data.payload
  }
  callback(404,payload);
}
const router = {
  'hello':handlers.hello,
  'notFound':handlers.notFound
};
