
/**
 * Module dependencies.
 */


var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var pg   = require('pg');
var app  = express();
var bugsnag = require("bugsnag");
bugsnag.register("093309e1989fb679bbe95994eff4ac47");

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bugsnag.requestHandler);

// development only
//if ('development' == app.get('env')) {
//  app.use(express.errorHandler());
//}

// Database URL and connection Object
var conString = "postgres://postgres:E_Dba007@localhost:5432/espresso";
// var conString = "postgres://postgres:ankit1234@localhost:5432/nodedb_development";
var connection = new pg.Client(conString);
// Connect PostgreSQL
connection.connect(function(err) {
  if(err) {
 //   return console.error('could not connect to postgres', err);
      bugsnag.notify(new Error("Fatal"),  err);
  }
});

// Database setup
// connection.query('DROP TABLE users');
connection.query("CREATE TABLE IF NOT EXISTS users(id integer, first_name varchar(128), last_name varchar(128), email varchar(128))");

// Add a new User
app.get("/users/new", function (req, res) {
  res.render("new", {
    title: 'Hackathon Reggaethon Express PostgreSQL Application'
  });
});

// Save the Newly created User
app.post("/users", function (req, res) {
  var first_name=req.body.first_name;
  var last_name=req.body.last_name;
  var email=req.body.email;
  
  connection.query('INSERT INTO users (first_name,last_name,email) VALUES ($1,$2,$3) RETURNING id', [first_name, last_name, email], function(err, docs) {
    res.redirect('/');
  });
});

// Create Node server 
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// App root
app.get('/', function(req, res){
  connection.query('SELECT * FROM users', function(err, docs) { 
    res.render('users', {users: docs, title: 'Hackathon Express PostgreSQL Application'});
  });
});
