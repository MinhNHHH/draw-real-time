<h1 align="center">
  <p>Draw Real Time</p>
</h1>
<a href="https://drawrt.vercel.app/"><p align="center"><img style="border-radius:20px;" src="./client/public/index.png"/></p></a>

![Draw](./client/public/demo.gif)

# Objective
- A little real-time online collaborative drawing program. <https://drawrt.vercel.app>
- Web Draw Real Time is a web app that allows users to draw on a shared canvas in real time.
# Install
## Run project local.
- Install the [Nodejs](https://nodejs.org/en/download/)
- Clone the project: `https://github.com/hoangminh981/draw-real-time`
- Cd to client: `./client`
- Build package : `npm install`.
# Start project
## How does it work?
Web Draw Real Time uses *sessions*, which connect users together.
All users in a session work on the same canvas.

Each session has a unique *session ID*, which can be set to anything.
A random 4-character session ID is generated if one is not provided.
A session's ID can be changed at any time so long as the new ID isn't already taken.

Sessions can also optionally have a password set on them, so that only users who are able to provide the password can join.
A session's password can be changed or removed at any time.

## Currently available tools
- Select `Keypress 1`
- Pen Tool `Keypress 2`
- Rectangle Tool `Keypress 3`
- Ellipse Tool `Keypress 4`
- Line Tool `Keypress 5`
- Text Editing `Keypress 6`
- Pan Tool `Alt/Option`
- Zoom Tool `Scroll`
- Colour Picker Tool

## How does it *really* work?
Web Draw Real Time uses WebSockets for the "Web" part, and the web Canvas API for the "Draw" part.

The WebSockets server uses the [ws module] for Node.js.When a user performs an action, the server is told about it, and if necessary, then tells all other session members about it.

[ws module]: https://github.com/websockets/ws
