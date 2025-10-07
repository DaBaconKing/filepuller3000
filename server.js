import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Allowed hostname
const ALLOWED_HOST = "http.cat";

app.get("/", async (req, res) => {
  const target = req.query.target;
  if (!target) return res.status(400).send("Missing target URL");

  try {
    const url = new URL(target);

    // ✅ Validate protocol
    if (!/^https?:$/.test(url.protocol)) {
      return res.status(400).send("Only http/https URLs are allowed");
    }

    // ✅ Check whitelist
    if (url.hostname !== ALLOWED_HOST) {
      return res.status(403).send("Domain not allowed");
    }

    const response = await fetch(url.href);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    res.set("content-type", contentType);
    response.body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching target URL");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
