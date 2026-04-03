const debug = (req, res, next) => {
  console.log('--- Debug Middleware ---'.yellow);
  console.log('Request Method:'.brightCyan, req.method);
  console.log('Request URL:'.brightCyan, req.originalUrl);
  console.log('Request Headers:'.brightCyan, req.headers);
  console.log('Request Headers.origin:'.brightCyan, req.headers.origin);
  console.log('Request Body:'.brightCyan, req.body);
  console.log('Request Query:'.brightCyan, req.query);
  console.log('------------------------'.yellow);
  
  next();
};

module.exports = debug;