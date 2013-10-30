var mongodb = require('./db');

function Publish(username, title, content, topicid, time){
	this.username  = username;
	this.title = title;
	this.content  = content;
	this.topicid = topicid == null ? (new Date().getTime().toString() + Math.floor(Math.random()*10000).toString()) : topicid;
	if(time){
		this.time = time;
	}else{
		this.time = new Date();
	}
}

module.exports = Publish;

Publish.prototype.save = function save(callback){
	var article = {
		username: this.username,
		title: this.title,
		content: this.content,
		time: this.time,
		topicid: this.topicid
	};

	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}

		db.collection('topic', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//collection.ensureIndex('user');
			collection.insert(article, {
				safe: true
			}, function(err,article){
				mongodb.close();
				callback(err,article);
			});
		});
	});
}

Publish.get = function(username, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}

		db.collection('topic', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			var query = {};
			if(username){
				query.username = username;
			}

			collection.find().sort({				//取多条数据
				time: -1
			}).toArray(function(err, docs){
				mongodb.close();
				if(err){
					callback(err, null);
				}

				var topics = [];

				docs.forEach(function(doc, index){
					var publish = new Publish(doc.username, doc.title, doc.content, doc.topicid, doc.time);
					var now = publish.time;
                	publish.time = moment(now).format("MM-DD HH:mm");					
					topics.push(publish);
				});
				callback(null, topics);
			})
		})
	})
}

Publish.getTopic = function(topicid, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}

		db.collection('topic', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			collection.findOne({topicid:topicid},function(err, docs){		//取单挑数据
				mongodb.close();
				if(err){
					callback(err, null);
				}
				
				var publish = new Publish(docs.username, docs.title, docs.content, docs.topicid, docs.time);	
				var now = publish.time;
            	publish.time = moment(now).format("YYYY-MM-DD HH:mm:ss");
				
				callback(null, publish)
			})
		})
	})
}

