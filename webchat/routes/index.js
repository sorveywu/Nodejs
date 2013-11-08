
/*
 * GET home page.
 */

module.exports = function(app){
	var users = {};

	app.get('/', function(req, res){
		if(req.cookies.user == null){
			res.redirect("login");
		}else{
			res.sendfile('views/index.html');
		}
	})

	app.get('/login', function(req, res){
		res.sendfile('views/login.html');
	})

	app.post('/login', function(req, res){
		if(users[req.body.username]){
			//用户已存在
			res.redirect('/login');
		}else{
			//用户不存在，允许登录
			res.cookie('user', req.body.username, {maxAge: 1000*60*60*24*30});
			res.redirect('/');
		}
	})
}