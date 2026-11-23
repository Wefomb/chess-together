import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { Chess } from 'chess.js';
import { randomBytes } from 'node:crypto';
const app=express();const http=createServer(app);const io=new Server(http);const rooms=new Map();
app.use(express.static('public'));
const code=()=>randomBytes(5).toString('hex');
function state(room){return {fen:room.game.fen(),history:room.game.history({verbose:true}).map(m=>({san:m.san,from:m.from,to:m.to,color:m.color})),turn:room.game.turn(),status:room.game.isCheckmate()?'Checkmate! '+(room.game.turn()==='w'?'Black':'White')+' wins':room.game.isDraw()?'Draw':room.game.isCheck()?'Check':'Playing',players:{w:!!room.players.w,b:!!room.players.b}}}
function emit(room){io.to(room.id).emit('state',state(room))}
io.on('connection',socket=>{
 socket.on('join',(requested,reply)=>{let id=typeof requested==='string'&&/^[a-f0-9]{10}$/.test(requested)?requested:code();let room=rooms.get(id);if(!room){room={id,game:new Chess(),players:{w:null,b:null},members:new Set()};rooms.set(id,room)}let color=!room.players.w?'w':!room.players.b?'b':'spectator';if(color!=='spectator')room.players[color]=socket.id;socket.join(id);socket.data.room=id;socket.data.color=color;room.members.add(socket.id);reply({id,color});emit(room)});
 socket.on('move',(payload,reply)=>{const room=rooms.get(socket.data.room);if(!room||!['w','b'].includes(socket.data.color)||room.players[socket.data.color]!==socket.id||room.game.turn()!==socket.data.color||room.game.isGameOver())return reply({ok:false,error:'Not your turn or game finished'});try{const move=room.game.move({from:payload.from,to:payload.to,promotion:payload.promotion||'q'});if(!move)return reply({ok:false,error:'Illegal move'});emit(room);reply({ok:true})}catch{return reply({ok:false,error:'Illegal move'})}});
 socket.on('restart',reply=>{const room=rooms.get(socket.data.room);if(!room||!['w','b'].includes(socket.data.color))return reply({ok:false});room.game.reset();emit(room);reply({ok:true})});
 socket.on('disconnect',()=>{const room=rooms.get(socket.data.room);if(!room)return;room.members.delete(socket.id);for(const c of ['w','b'])if(room.players[c]===socket.id)room.players[c]=null;emit(room);if(!room.members.size)rooms.delete(room.id)})
});
const port=process.env.PORT||3000;http.listen(port,'0.0.0.0',()=>console.log('Chess Together running on port '+port));
