const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "client")));

const publicVapidKey = "BMUCN1KmaOzTkG2k3tNhdQjJWNNWokLHXKt1k9oC3FoRuFopjVw7ZBUKy2YJIOsKyi4EmP5V3SEJzS9DCTFKBmk";
const privateVapidKey = "roxaa0f7EDksNRnAkYT3qREoWtpYZfp4NPqtHJJ364w";

webpush.setVapidDetails(
  process.env.DOMAIN,
  publicVapidKey,
  privateVapidKey
);

// Subscribe route
app.post("/subscribe", (req, res) => {
  const subscription = req.body;

  res.status(201).json({});
  const payload = JSON.stringify({ title: "Hello from Node.js!" });

  webpush
    .sendNotification(subscription, payload)
    .catch(err => console.error(err));
});

app.listen(5000, () => console.log("Server started on port 5000"));