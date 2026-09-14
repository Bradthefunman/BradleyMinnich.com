import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const requiredFiles = [
  "index.html",
  "work/index.html",
  "about/index.html",
  "collaborate/index.html",
  "sponsor/index.html",
  "contact/index.html",
  "404.html",
  "assets/styles.css",
  "assets/site-data.js",
  "assets/app.js",
  "assets/social-card.svg",
  "functions/api/contact.js",
  "sitemap.xml",
  "robots.txt",
  "CNAME",
  "site.webmanifest"
];

const failures = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing ${file}`);
}

const htmlFiles = [
  "index.html",
  "work/index.html",
  "about/index.html",
  "collaborate/index.html",
  "sponsor/index.html",
  "contact/index.html",
  "404.html"
];

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  if (!/<title>[^<]+<\/title>/i.test(source)) failures.push(`${file}: missing title`);
  if (!/<meta name="description" content="[^"]+"/i.test(source)) failures.push(`${file}: missing description`);
  if (!/<link rel="canonical" href="https:\/\/bradleyminnich\.com\//i.test(source)) failures.push(`${file}: missing canonical`);
  if (!source.includes("/assets/styles.css")) failures.push(`${file}: missing stylesheet`);
  if (!source.includes("/assets/site-data.js")) failures.push(`${file}: missing data script`);
  if (!source.includes("/assets/app.js")) failures.push(`${file}: missing app script`);
  if (/TODO|PLACEHOLDER|lorem ipsum/i.test(source)) failures.push(`${file}: placeholder text found`);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (!packageJson.scripts?.build || !packageJson.scripts?.test) failures.push("package.json: build/test scripts missing");

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
for (const url of ["https://bradleyminnich.com/", "https://bradleyminnich.com/work/", "https://bradleyminnich.com/about/", "https://bradleyminnich.com/collaborate/", "https://bradleyminnich.com/sponsor/", "https://bradleyminnich.com/contact/"]) {
  if (!sitemap.includes(`<loc>${url}</loc>`)) failures.push(`sitemap.xml: missing ${url}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Site checks passed: ${requiredFiles.length} required files, ${htmlFiles.length} HTML pages.`);