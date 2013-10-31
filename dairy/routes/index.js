/**
 * GET home page.
 * Powered By Sorvey.Wu
 * http://www.sorvey.com
 * At 2013-10-29
 */
var User = require('../models/user.js');
var crypto = require('crypto');
var markdown = require('markdown-js');		//markdown编辑器
var moment = require('moment');				//moment格式化时间插件
var Publish = require('../models/publish.js');
var Reply = require('../models/reply.js');

module.exports = function(app){
	app.get('/',function(req, res){
		Publish.get(null, function(err, topics){
			if(err){
				topics = [];
			}
			res.render('index', {
				title: '主页',
				topics:topics,
				user: req.session.user,
				success:req.flash('success').toString(),
		        error : req.flash('error').toString()	
			})
		})	
	})
	//用户注册
	app.get('/reg', checkNotLogin);
	app.get('/reg',function(req, res){
		res.render('reg',{
			title: '用户注册',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString(),
		})
	})

	app.post('/reg', checkNotLogin);
	app.post('/reg', function(req, res){
		if(req.body['password-repeat'] != req.body['password']){
			req.flash('error','两次输入的口令不一致！');
			res.redirect('/reg');
		}

		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');
		var now = moment().format("YYYY-MM-DD HH:mm:ss");

		var newUser = new User({
			username: req.body.username,
			password: password,
			email: req.body.email,
			time: now
		})

		User.getUser(newUser.username, function(err, user){
			if(user){
				err = '用户已存在';    
	        }

	        if(err){
	        	req.flash('error', err);
	        	return res.redirect('/reg');
	        }
	        newUser.save(function(err){
	        	if(err){
	        		req.flash('error',err);
	        		return res.redirect('reg');
	        	}
	        	req.session.user = newUser;
				req.flash('success','注册成功');
	            res.redirect('/');	        	
	        })

		})
		
	})
	//用户登录
	app.get('/login', checkNotLogin);
	app.get('/login', function(req, res){
	    res.render('login',{
	        title:'登录',
	        user:req.session.user,
	        success:req.flash('success').toString(),
	        error:req.flash('error').toString()
	    }); 
	});	
	app.post('/login', checkNotLogin);
	app.post('/login', function(req, res){
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');
		User.getUser(req.body.username, function(err,user){
			if(!user){
				req.flash('error', '用户名不存在!');
				res.redirect('/login');
			}
			if(user.password != password){
				req.flash('error', '密码错误！');
				res.redirect('/login');
			}
			req.session.user = user;
			req.flash('success', '登录成功');
			res.redirect('/');
		})
	})
	//用户登出
	app.get('/logout', checkLogin);		//检测未登录
	app.get('/logout', function(req, res){
		req.session.user = null;
		req.flash('success','登出成功');
		res.redirect('/');
	})
	//发表文章
	app.get('/publish', checkLogin);
	app.get('/publish', function(req, res){
		res.render('publish', {
			title: '话题发布',
			user: req.session.user,
			success:req.flash('success').toString(),
	        error : req.flash('error').toString()			
		})
	})
	app.post('/publish', checkLogin);
	app.post('/publish', function(req, res){
		var title = req.body.title,
			content = markdown.makeHtml(req.body.content);
		var currentUser = req.session.user;
		var now = new Date().getTime();
		var publish = new Publish(currentUser.username, title, content, null , now);
		publish.save(function(err){
			if(err){
				req.flash('error', err); 
	            return res.redirect('/publish');				
			}
			req.flash('success', '发布成功!');
	        res.redirect('/');			
		})
	})

	app.get('/topic/:topicid', function (req, res) {
    	Publish.getTopic(req.params.topicid, function (err, topic) { 
	       	if (err) { 
	        	req.flash('error', err); 
	         	return  res.redirect('/'); 
	      	} 
      		res.render('topic', { 
      			title: topic.title,
        		topic: topic,
        		count: typeof(topic.message)=='undefined'? 0 : topic.message.length,
				user: req.session.user,
				success:req.flash('success').toString(),
	        	error : req.flash('error').toString()        		
      		}); 
    	}); 
	});

	app.post('/topic/:reply', function(req, res){
		var username = req.session.user.username,
			message = req.body.message,
			time = new Date().getTime(),
			topicid = req.body.topicid;
		var reply = new Reply(username, message, topicid, time);
		reply.save(function(err){
			if(err){
				req.flash('error', err);
				return res.redirect('/publish');
			}
			res.redirect('/topic/'+topicid);
		})


	})

}


function checkLogin(req, res, next){
	if(!req.session.user){
		req.flash('error','未登录');
		res.redirect('/login');
	}
	next();
}

function checkNotLogin(req, res, next){
	if(req.session.user){
		req.flash('error', '已登录');
		res.redirect('/');
	}
	next();
}