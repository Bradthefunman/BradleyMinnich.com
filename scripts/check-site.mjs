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
  "shop/index.html",
  "404.html",
  "assets/styles.css",
  "assets/site-data.js",
  "assets/app.js",
  "assets/social-card.svg",
  "functions/api/contact.js",
  "sitemap.xml",
  "robots.txt",
  "CNAME",
  "site.webmanifest",
  "ads.txt"
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
  "shop/index.html",
  "404.html"
];

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  if (!/<title>[^<]+<\/title>/i.test(source)) failures.push(`${file}: missing title`);
  if (!/<meta name="description" content="[^"]+"/i.test(source)) failures.push(`${file}: missing description`);
  if (!/<link rel="canonical" href="https:\/\/bradleyminnich\.com\//i.test(source)) failures.push(`${file}: missing canonical`);
  if (!source.includes("assets/styles.css")) failures.push(`${file}: missing stylesheet`);
  if (!source.includes("assets/site-data.js")) failures.push(`${file}: missing data script`);
  if (!source.includes("assets/app.js")) failures.push(`${file}: missing app script`);
  if (/TODO|lorem ipsum/i.test(source)) failures.push(`${file}: unfinished copy found`);
}

const homepage = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const route of ["work/", "about/", "collaborate/", "sponsor/", "shop/", "contact/"]) {
  if (!homepage.includes(`href="${route}"`)) failures.push(`index.html: missing navigation link ${route}`);
}

for (const [file, formType] of [["collaborate/index.html", "collaboration"], ["sponsor/index.html", "sponsorship"], ["contact/index.html", "general"]]) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  if (!source.includes("data-contact-form")) failures.push(`${file}: missing form hook`);
  if (!source.includes('action="api/contact"') && !source.includes('action="../api/contact"')) failures.push(`${file}: missing form action`);
  if (!source.includes(`name="formType" value="${formType}"`)) failures.push(`${file}: wrong form type`);
  for (const field of ["name", "email", "message", "honeypot"]) {
    if (!source.includes(`name="${field}"`)) failures.push(`${file}: missing field ${field}`);
  }
}

const shopPage = fs.readFileSync(path.join(root, "shop/index.html"), "utf8");
for (const productUrl of [
  "https://bradthefunman-shop.fourthwall.com/products/bradley-minnich-build-further-sweatshirt",
  "https://bradthefunman-shop.fourthwall.com/products/bradley-minnich-portrait-tee",
  "https://bradthefunman-shop.fourthwall.com/products/bradley-minnich-face-sweatshirt",
  "https://bradthefunman-shop.fourthwall.com/products/bradley-minnich-face-tee"
]) {
  if (!shopPage.includes(productUrl)) failures.push(`shop/index.html: missing product link ${productUrl}`);
}

const adsenseScriptNeedle = "pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2976233413120261";
for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  if (!source.includes(adsenseScriptNeedle)) failures.push(`${file}: missing AdSense script`);
}
const adsTxt = fs.readFileSync(path.join(root, "ads.txt"), "utf8");
if (!adsTxt.includes("google.com, ca-pub-2976233413120261, DIRECT, f08c47fec0942fa0")) failures.push("ads.txt: missing AdSense publisher record");

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (!packageJson.scripts?.build || !packageJson.scripts?.test) failures.push("package.json: build/test scripts missing");

const functionSource = fs.readFileSync(path.join(root, "functions/api/contact.js"), "utf8");
if (!functionSource.includes("RESEND_API_KEY") || !functionSource.includes("CONTACT_FROM_EMAIL")) failures.push("contact function: missing secret configuration");
if (/sk_[a-z0-9]{16,}/i.test(functionSource)) failures.push("contact function: possible committed API key");

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
for (const url of ["https://bradleyminnich.com/", "https://bradleyminnich.com/work/", "https://bradleyminnich.com/about/", "https://bradleyminnich.com/collaborate/", "https://bradleyminnich.com/sponsor/", "https://bradleyminnich.com/shop/", "https://bradleyminnich.com/contact/"]) {
  if (!sitemap.includes(`<loc>${url}</loc>`)) failures.push(`sitemap.xml: missing ${url}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Site checks passed: ${requiredFiles.length} required files, ${htmlFiles.length} HTML pages.`);