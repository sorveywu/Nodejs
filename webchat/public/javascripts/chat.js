$(document).ready(function(){
	var socket = io.connect();

	var from = $.cookie('user');	//sorvey
	var to = 'all'; //设置默认接收对象为'所有人'

	socket.emit('online', {user: from});

	socket.on('online', function(data){
		if(data.user != from){
			var sys = '<div class="noticelist">(' + now() + '):' + ' 用户 <font color="blue">' + data.user + '</font> 上线了！</div>';
		}else{
			var sys = '<div class="noticelist">(' + now() + '): <font color="red">你</font> 进入了聊天室！</div>';
		}
		$(".noticebox").prepend(sys + "<br/>");
		flushUsers(data.users);
		showSayTo();
	})

	socket.on('say', function(data){
		if(data.to == 'all'){
			$(".contents").append('<div class="name">' + data.from + '(' + now() + ')</div><div class="neirong">' + data.msg + '</div><br />');
		}

		if (data.to == from) {
		    $(".contents").append('<div style="color:#00f" >' + data.from + '(' + now() + ')对 你 说：<br/>' + data.msg + '</div><br />');
		  }
	})

	socket.on('offline', function (data) {
	  //显示系统消息
	  var sys = '<div class="noticelist" style="color:#f00">(' + now() + '):' + ' 用户 <font color="blue">' + data.user + '</font> 下线了！</div>';
	  $(".noticebox").prepend(sys + "<br/>");
	  //刷新用户在线列表
	  flushUsers(data.users);
	  //如果正对某人聊天，该人却下线了
	  if (data.user == to) {
	    to = "all";
	  }
	  //显示正在对谁说话
	  showSayTo();
	});

	//服务器关闭
	socket.on('disconnect', function() {
	  	var sys = '<div style="color:#f00">系统:连接服务器失败！</div>';
	  	$("#contents").append(sys + "<br/>");
	  	$("#list").empty();
	});

	//重新启动服务器
	socket.on('reconnect', function() {
	  	var sys = '<div style="color:#f00">系统:重新连接服务器！</div>';
	  	$("#contents").append(sys + "<br/>");
	  	socket.emit('online', {user: from});
	});

	function flushUsers(users){
		$(".list").empty();
		$(".list").append('<li title="双击聊天" alt="all" class="sayingto" onselectstart="return false">所有人</li>');
		for( var i in users){
			$(".list").append('<li alt="' + users[i] + '" title="双击聊天" onselectstart="return false">' + users[i] + '</li>');
		}

		$(".list > li").dblclick(function(){
			if($(this).attr('alt') != from){
				to = $(this).attr('alt');
				$(".list > li").removeClass('sayingto');
				$(this).addClass("sayingto");
				showSayTo();
			}
		})
	}

	function showSayTo(){
		$("#from").html(from);
		$("#to").html( to == "all" ? "所有人" : to);
	}

	function now(){
  		var date = new Date();
  		var time = date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
  		return time;
	}

	$(".btn").click(function(){
		var msg = $(".msg").val();
		if( msg == ""){
			return;
		}

		if( to == "all"){
			$(".contents").append('<div class="name">你 (' + now() + ')</div><div class="neirong">' + msg + '</div>');
		}else{
			$(".contents").append('<div class="name" style="color:#00f" >你(' + now() + ')对 ' + to + ' 说：</div><div class="neirong">' + msg + '</div><br />');
		}

		//发送发话信息
  		socket.emit('say', {from: from, to: to, msg: msg});
  		//清空输入框并获得焦点
  		$(".msg").val("").focus();
	})
})