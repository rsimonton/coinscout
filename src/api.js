import io from 'socket.io-client';
import CCC from './crypto-compare.js';


const ws = io('wss://streamer.cryptocompare.com'),
	debug = true,
	noErr = null;


ws.on('connect', function(){
	debug && console.log('Connected!')
});

ws.on('event', function(data){
	debug && console.log('Received event:');
	debug && console.dir(data);
});

ws.on('disconnect', function(){
	debug && console.log('Disconnected :(');
});


function apiConnect(callback) {
	// Subscribe
	ws.emit('SubAdd', { subs: ['2~Coinbase~ETH~USD'] } );
	// Listen for data
	ws.on('m', data => {
		// Decode message using crypto compare's util function
		if (data.substring(0, data.indexOf("~")) === CCC.STATIC.TYPE.CURRENT) {
			callback(noErr, CCC.CURRENT.unpack(data));
		}
	});
}


export default apiConnect;