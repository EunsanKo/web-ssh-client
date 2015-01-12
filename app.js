
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  ,passport = require("passport")
  ,LocalStrategy = require('passport-local').Strategy;;

var Connection = require('ssh2');


var app = express();

/*
	List your servers.
	It makes button for connecting server
*/
var servers = {
	"server1":"127.0.0.1",
	"server2":"127.0.0.2",
	"server2":"127.0.0.3",

}

/*
Edit here.
It supposed to every server has same port, account, password
*/
var port = '22';
var account = 'account';
var password = 'password';


var users = [
    { id: 1, username: 'xpush', password: 'xpush', email: 'xpush@gmail.com' }
  
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));

// all environments

app.configure(function(){
	app.set('port', process.env.PORT || 8888);
	app.set('views', __dirname + '/views');
	
	app.engine('html', require('ejs').renderFile);
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());

	app.use(express.cookieParser('znzlvktj'));
	app.use(express.session({ secret: 'SECRET' }));
	app.use(passport.initialize());
	app.use(passport.session());
	

	app.use(express.methodOverride());
	app.use(app.router);
	
	app.use(express.static(path.join(__dirname, 'public')));
});






// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);

app.get('/login', function(req, res){
  res.render('login.html');
});

app.get('/', ensureAuthenticated, routes.index);


app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  });
 
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}




var server = http.createServer(app);
var io = require('socket.io')(server);

server.listen(app.get('port'), function(){
	console.log("express server listening on port " + app.get('port'));

});


var socketList = {};

io.on('connection', function (socket) {
  socket.emit('servers', { servers: servers });
  socket.on('my other event', function (data) {
    console.log(data);
  });

  socket.on('connect-server', function (data) {
    if(socketList[socket.id]){
  		socketList[socket.id].conn.end();
  	}
  	setTimeout(function() {
  		console.log(data);
	    var id = data.id;
	    var ip = servers[id];
	    var port = port;
	    var account = account;
	    var password = password;
	    
	    var ssh ;
	    try{
	    	ssh = new ssh_connection(ip,port,account,password,socket);	
	    }catch(e){
	    	console.log(e);
	    }
	    
	    socketList[socket.id] = ssh;
  	}, 100);
    

  });

  socket.on('disconnect', function(data){
  	if(socketList[socket.id]){
  		socketList[socket.id].conn.end();
  	}
  	delete socketList[socket.id];
  })

  socket.on('command', function(data){
  	var com = data.command;
  	var ssh = socketList[socket.id];
  	
  	ssh.stream.write(com+"\n");
  })

});


var ssh_connection = function(ip,port,account,password,socket){
	var connection = {};


	var conn = new Connection({readyTimeout : 100000});
  conn.stream = {};
	conn.on('ready', function() {
	  console.log('Connection :: ready');
	  

	  conn.shell(function(err, _stream) {
	    if (err) console.log(err);

	    _stream.on('close', function(a,b,c) {
	      console.log('Stream :: close');
	      
	      
	      if(socketList[socket.id]){
	      	socketList[socket.id].conn.end();
	      	delete socketList[socket.id];	
	      }
	      
	      socket.emit('disconnect by server',{disconnectIp:_stream._channel._conn._host});

	      
	    }).on('data', function(data) {
      	console.log('STDOUT: ' + data);
	      socket.emit('command-result',data.toString().trim())

			}).stderr.on('data', function(data) {
	      console.log('STDERR: ' + data);
	    });
	  
	    connection.stream = _stream;
	  
	  });


	}).on('error',function(data){
		
		socket.emit('connect fail',{});
	}).connect({
	  host: ip,
	  port: port,
	  username: account,
	  password: password
	});	


	connection.conn = conn;
	
	return connection;
}

