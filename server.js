require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const AccessToken = require("twilio").jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const express = require("express");
const app = express();
const port = 8000;

// use the Express JSON middleware
app.use(express.json());

// create the twilioClient
const twilioClient = require("twilio")(
  process.env.TWILIO_API_KEY_SID,
  process.env.TWILIO_API_KEY_SECRET,
  { accountSid: process.env.TWILIO_ACCOUNT_SID }
);

const findOrCreateRoom = async (roomName) => {
  try {
    // see if the room exists already. If it doesn't, this will throw
    // error 20404.
    await twilioClient.video.v1.rooms(roomName).fetch();
  } catch (error) {
    // the room was not found, so create it
    if (error.code == 20404) {
      await twilioClient.video.v1.rooms.create({
        uniqueName: roomName,
        type: "group",
      });
    } else {
      // let other errors bubble up
      throw error;
    }
  }
};

const getAccessToken = (roomName, user = uuidv4()) => {
  console.log(user);
  // create an access token
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY_SID,
    process.env.TWILIO_API_KEY_SECRET,
    // generate a random unique identity for this participant
    { identity: user }
  );
  // create a video grant for this specific room
  const videoGrant = new VideoGrant({
    room: roomName,
  });

  // add the video grant
  token.addGrant(videoGrant);
  // serialize the token and return it
  return token.toJwt();
};

app.get("/token", async (req, res) => {
  const roomName = req.body.room || "mobileiosandroid3";
  const userName = req.body.username;
  console.log(`REQUESTING TOKEN for Room ${roomName} and user ${userName}`);
  // generate an Access Token for a participant in this room
  const token = getAccessToken(roomName, userName);
  console.log(token);
  res.send({
    token: token,
  });
});

app.post("/join-room", async (req, res) => {
  // return 400 if the request has an empty body or no roomName
  if (!req.body || !req.body.roomName) {
    return res.status(400).send("Must include roomName argument.");
  }
  const roomName = req.body.roomName;
  if (!req.body || !req.body.userName) {
    return res.status(400).send("Must include userName argument.");
  }
  const userName = req.body.userName;
  // find or create a room with the given roomName
  findOrCreateRoom(roomName);
  // generate an Access Token for a participant in this room

  console.log(`Getting a token for ${roomName} and user ${userName}`)

  const token = getAccessToken(roomName, userName);
  res.send({
    token: token,
  });
});

// serve static files from the public directory
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("public/index.html");
});

// Start the Express server
app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});
