var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var Redis = require('ioredis')
var redis = new Redis()

server.listen(8080);
// WARNING: app.listen(80) will NOT work here!

//redis.set('onlineUsers', 'me');

let onlineUsers = []

app.get('/online-users', function(req, res) {
    res.status(200).json(onlineUsers)
})

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', function (socket) {
  console.log('connected', socket.id)
  socket.emit('online_users', onlineUsers)
  
  socket.on('new_user', function(data) {
    console.log('new_user', data)   
    //console.log(io.sockets.clients())
    let newUser = {
        _id: socket.id,
        username: data.username,
        message_count: 0
    }
    onlineUsers.push(newUser)
    
    redis.hset("userdata:userA", "status", "online");

    socket.broadcast.emit('new_user', newUser)
    console.log('onlineusers', onlineUsers)
  })

  socket.on('test_message', function(data) {
    console.log('test_message', data)
  })

  socket.on('new_message', function(data) {
    //console.log(socket)
    
    data.from = socket.id
    console.log('new_message_data', data)
    io.to(data.to).emit('hey', data)
    //socket.emit('message_received', {data: data})
  })

  socket.on('disconnect', function() {
    console.log('disconnected', socket.id)        
    let removeIndex = onlineUsers.map((item) => item.id).indexOf(socket.id);
    onlineUsers.splice(removeIndex, 1);
    socket.broadcast.emit('disconnected', 'gitti')
    console.log('onlineusers:', onlineUsers)
  })

});