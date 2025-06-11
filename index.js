const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/towns", async (req, res) => {
  try {
    const url = "https://online.joinupbaltic.eu/export/default.php?samo_action=api&version=1.0&type=json&oauth_token=19749d2ce6de47a3b429d9cd49a8e970&action=SearchTour_TOWNFROMS";
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from JoinUp" });
  }
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
