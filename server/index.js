const express = require("express");
const app = express();
const fetch = require("node-fetch");
const cors = require("cors");
const geojson = require("geojson");
const PORT = 8081;

app.use(cors());
app.get("/api/v1/data", async (req, res) => {
  try {
    const response = await fetch("https://bing.com/covid/data");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.json({ error: err });
  }
});

app.listen(PORT, () => {
  console.log("Listening on Port", PORT);
});
