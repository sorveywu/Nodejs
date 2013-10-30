
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var ejs = require('ejs');
var partials = require('express-partials');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');		//使用flash必备
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('.html',ejs.__express);
app.set('view engine', 'html');
app.use(flash());							//使用flash必备
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(partials());
app.use(express.cookieParser());
app.use(express.session({ 
		secret: settings.cookieSecret, 
		store: new MongoStore({ 
		db: settings.db
   }) 
}));

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.use(function(req,res,next){				//使用flash必备
	var err = req.flash('error'),
	    success = req.flash('success');
	res.locals.user = req.session.user;
	res.locals.error = err.length ? err : null;
	res.locals.success = success.length ? success : null;
	next();
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

routes(app);