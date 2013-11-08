
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
var users = {};//存储在线用户列表的对象
var server = http.createServer(app);
var io = require('socket.io').listen(server); //将 socket.io 绑定到服务器上，于是任何连接到该服务器的客户端都具备了实时通信功能
io.sockets.on('connection', function(socket){ //服务器监听所有客户端，并返回该新连接对象，接下来我们就可以通过该连接对象（socket）与客户端进行通信了。
	//有人上线
	socket.on('online', function (data) {
	  //将上线的用户名存储为 socket 对象的属性，以区分每个 socket 对象，方便后面使用
	  socket.name = data.user;
	  //users 对象中不存在该用户名则插入该用户名
	  if (!users[data.user]) {
	    users[data.user] = data.user;
	  }
	  //向所有用户广播该用户上线信息
	  io.sockets.emit('online', {users: users, user: data.user});
	});

	//有人发话
	socket.on('say', function (data) {
	  	if (data.to == 'all') {
	    	//向其他所有用户广播该用户发话信息
	    	socket.broadcast.emit('say', data);
	  	} else {
	    	//向特定用户发送该用户发话信息
	    	//clients 为存储所有连接对象的数组
	    	var clients = io.sockets.clients();
	    	//遍历找到该用户
	    	clients.forEach(function (client) {
		      	if (client.name == data.to) {
		        	//触发该用户客户端的 say 事件
		        	client.emit('say', data);
		      	}
	    	});
	  	}
	});

	//有人下线
	socket.on('disconnect', function() {
	  	//若 users 对象中保存了该用户名
	  	if (users[socket.name]) {
		    //从 users 对象中删除该用户名
		    delete users[socket.name];
		    //向其他所有用户广播该用户下线信息
		    socket.broadcast.emit('offline', {users: users, user: socket.name});
		  }
	});
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

routes(app);