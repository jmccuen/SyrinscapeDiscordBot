# SyrinscapeDiscordBot


This is a very early version of a bot that will interface with the Syrinscape Online Beta to stream the audio to Discord. Right now, it only establishes the websocket connected and received messages with .ogg data -- still working out whether there is an audio websocket stream or if we need to mix the audio ourselves.


You'll need to create your own Discord bot to test, and add its token in the config.json file. You'll also need your device ID that gets created and linked by the Syrinscape Online Player, and add that to the device UUID json message on line 99 of the index.js (sorry, this will all be added to a config file at a later date, right now my focus is on getting it to work)
