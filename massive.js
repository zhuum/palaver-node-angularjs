var db = require('massive');
db.connect('postgres://postgres:password@localhost/palaver', function(err,db) {
	// db.comments.each(function(x){
	// 	console.log(x);
	// });
	db.disconnect();
});

console.log('done.');
