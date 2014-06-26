var pg = require('pg');
var conString = "postgres://postgres:password@localhost/palaver";

pg.connect(conString, function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }


  client.query('SELECT * from comments', function(err, result) {
  
    //call `done()` to release the client back to the pool
    done();

    if(err) {
      return console.error('error running query', err);
    }
  
    console.log(result);
    //output: 1
  });
});