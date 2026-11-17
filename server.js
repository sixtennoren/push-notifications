const express = require("express");
const webpush = require("web-push");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));

const publicVapidKey = "BMUCN1KmaOzTkG2k3tNhdQjJWNNWokLHXKt1k9oC3FoRuFopjVw7ZBUKy2YJIOsKyi4EmP5V3SEJzS9DCTFKBmk";
const privateVapidKey = "roxaa0f7EDksNRnAkYT3qREoWtpYZfp4NPqtHJJ364w";

webpush.setVapidDetails(
  process.env.DOMAIN || "mailto:demo@example.com",
  publicVapidKey,
  privateVapidKey
);

// In-memory store: endpoint -> { name, subscription } (lost on restart)
// One user can have several entries (e.g. phone + laptop).
const subscriptions = new Map();

app.post("/subscribe", (req, res) => {
  const { name, subscription } = req.body;
  subscriptions.set(subscription.endpoint, { name: name || "anonymous", subscription });
  console.log(`New subscription for "${name}" (${subscriptions.size} total)`);
  res.status(201).json({ count: subscriptions.size });
});

// List of distinct user names, for the controller dropdown
app.get("/users", (req, res) => {
  const names = [...new Set([...subscriptions.values()].map(s => s.name))];
  res.json(names);
});

app.post("/fire", async (req, res) => {
  const { to, title, body, channel } = req.body;
  const payload = JSON.stringify({
    title: title || "Hello from Node.js!",
    body: body || "This is a push notification!",
    channel: channel || null,
  });

  // Empty "to" = everyone
  const targets = [...subscriptions.values()].filter(s => !to || s.name === to);

  let sent = 0;
  await Promise.all(
    targets.map(({ subscription }) =>
      webpush
        .sendNotification(subscription, payload)
        .then(() => sent++)
        .catch(err => {
          console.error("Push failed:", err.statusCode, err.body);
          // Subscription expired or unsubscribed: drop it
          if (err.statusCode === 404 || err.statusCode === 410) {
            subscriptions.delete(subscription.endpoint);
          }
        })
    )
  );

  console.log(`Fired to ${sent}/${targets.length} subscription(s) (to: ${to || "everyone"})`);
  res.json({ sent, total: targets.length });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
