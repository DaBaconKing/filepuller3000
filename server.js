import express from "express";
import fetch from "node-fetch";
import cheerio from "cheerio"; // 🧠 HTML parser

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Allowed hostname
const ALLOWED_HOST = "http.cat";

app.get("/favsite", async (req, res) => {
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

    // 🔍 Fetch HTML and parse for favicon
    const htmlResponse = await fetch(url.href);
    if (!htmlResponse.ok) throw new Error(`Failed to fetch HTML: ${htmlResponse.status}`);
    const html = await htmlResponse.text();
    const $ = cheerio.load(html);

    // 🧭 Try to find favicon link
    let faviconHref =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      "/favicon.ico";

    // 🛠️ Resolve relative URLs
    const faviconUrl = new URL(faviconHref, url.origin).href;

    const faviconResponse = await fetch(faviconUrl);
    if (!faviconResponse.ok) throw new Error(`Failed to fetch favicon: ${faviconResponse.status}`);

    const contentType = faviconResponse.headers.get("content-type") || "image/x-icon";
    res.set("content-type", contentType);
    faviconResponse.body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching favicon");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
