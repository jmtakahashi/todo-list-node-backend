const debug = (req, res, next) => {
  console.log('--- Debug Middleware ---'.yellow);
  console.log('Request Method:'.cyan, req.method);
  console.log('Request URL:'.cyan, req.originalUrl);
  console.log('Request Headers:'.cyan, req.headers);
  console.log('Request Body:'.cyan, req.body);
  console.log('Request Query:'.cyan, req.query);
  console.log('------------------------'.yellow);
  next();
};

module.exports = debug;