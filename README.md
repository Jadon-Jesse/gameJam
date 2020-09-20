# GameJam

### Context
While we're still deciding on whether we want to play a game or make a game... I thought i'd advocate for 'make a game' by putting together a super 
basic demo using [three.js](https://threejs.org/)


### About
The application is written in javascript and simply sets up a basic scene with some randomly generated buildings. 
It also gives you the ability to fly around those building in first-person.


### How to run
This repo contains all the files needed to run the demo in your browser (firefox or chrome). Just follow these steps:

1. Clone this repo to your local machine
2. Run "npm start" for a development build
3. Open index.html in your browser (firefox). Alternatively, if using vs code, run a Live Server using the extension: https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer


### How to play
I'm not sure whats the best way to include static assets (models & shit) into the project folder using webpack - so I ended up coming up with a super hacky 
solution that uses the copy-webpack-plugin to copy the assets folder into the build dir. Sadly this hack only works in firefox after updating 
the privacy.file_unique_origin preference.

To update the privacy.file_unique_origin in firefox:
1. In the firefox address bar type in "about:config"
2. Accept risk and continue
3. Search for "privacy.file_unique_origin"
4. Toggle the value to "false"



* Use W, S, A & D to move around the scene
* Use your mouse to control the camera


### Notes
* This is just a demo

