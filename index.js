const Discord = require("discord.js");
const client = new Discord.Client();
const WebSocketClient = require('websocket').client;
const { prefix, token } = require("./config.json");

const uri = 'wss://s6.syrinscape.com/ws-online-player/websocket';

const streamStruct = {
    textChannel: null,
    voiceChannel: null,
    connection: null,
    ws: null,
    volume: 5,
    playing: false
};

var stream = undefined;

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async message => {

  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  //const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    execute(message);
    return;
  } else if (message.content.startsWith(`${prefix}stop`)) {
      stop(message);
  } else {
    message.channel.send("You need to enter a valid command!");
  }
});

async function execute(message) {
    const args = message.content.split(" ");

    const voiceChannel = message.member.voice.channel;
        if (!voiceChannel)
        return message.channel.send(
            "You need to be in a voice channel to play music!"
        );
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
            "I need the permissions to join and speak in your voice channel!"
        );
    }

    if (!stream) {
        const streamStruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            ws: null,
            volume: 5,
            playing: true
        };
        
        //queue.set(message.guild.id, queueContruct);

        try {
            var connection = await voiceChannel.join();
            streamStruct.connection = connection;

            try {
                var ws = new WebSocketClient();
                ws.on('connectFailed', function(error) {
                    console.log('Connect Error: ' + error.toString());
                });
                ws.on('connect', function(connection) {
                    connection.on('error', function(error) {
                        console.log("Connection Error: " + error.toString());
                    });
                    connection.on('message', function(message) {
                        console.log(message);
                        console.log("Received data of type + " + message.type);
                        if (message.type === 'utf8') {
                            console.log( message.utf8Data);
                        }
                    });


                    var m = `{
                            "message": "register",
                            "device_uuid": ""                        
                        }`;
                        
                    connection.sendUTF(m);

                    if (connection.connected) {
                        m =  `{
                            "message": "request_linkup",
                            "params": { 
                                "device_name": "SyrinscapeBot",
                                "player_version": "1.4.6-20200115",
                                "is_stopped": false
                            }
                        }`;
                        connection.sendUTF(m);
                    }
                    console.log("Registered!")
                });

                ws.connect(uri);
                streamStruct.ws = ws;
                stream = streamStruct;
                play();

            } catch (err) {
                console.log(err);
                //queue.delete(message.guild.id);
                return message.channel.send(err);
            }


        

        } catch (err) {
            console.log(err);
            //queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    }
}

function stop(message) {
  if (!message.member.voice.channel) {
        return message.channel.send(
        "You have to be in a voice channel to stop the music!"
        );
    }
    stream.connection.dispatcher.end();

}

function play() {
  //const serverQueue = queue.get(guild.id);
  if (!stream.ws) {
    stream.voiceChannel.leave();
    //queue.delete(guild.id);
    return;
  }
  const dispatcher = stream.connection
    .play(stream.ws.socket)
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(stream.volume / 5);
  stream.textChannel.send('Starting to play Syrinscape!');
}

client.login(token);