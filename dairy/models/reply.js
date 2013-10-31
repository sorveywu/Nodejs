var mongodb = require('./db');

function Reply(username, message, topicid, time){
	this.username = username;
	this.message = message;
	this.topicid = topicid;
	if(time){
		this.time = time;
	}else{
		this.time = new Date();
	}
}

module.exports = Reply;

Reply.prototype.save = function (callback){
	var msg = {
		username: this.username,
		message: this.message,
		topicid: this.topicid,
		time: this.time
	}

	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}

		db.collection('topic',function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			collection.update({"topicid":msg.topicid},{$push:{"message":msg}},{
				safe: true
			},function(err, msg){
				mongodb.close();
				callback(err,msg);
			});
		});
	});
}

/*Reply.getReply = function(topicid, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}

		db.collection('reply', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			collection.find({topicid:topicid}).sort({
				time: -1
			}).toArray(function(err, docs){		//取单挑数据
				mongodb.close();
				if(err){
					callback(err, null);
				}
				
				var msgs = []
				docs.forEach(function(doc, index){
					var reply = new Reply(docs.username, docs.message, docs.topicid, docs.time);	
					var now = reply.time;
	            	reply.time = moment(now).format("MM-DD HH:mm");
					msgs.push(reply);
				})
				callback(null, msgs);
			})
		})
	})
	
}*/