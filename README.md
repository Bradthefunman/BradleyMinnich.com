# BradleyMinnich.com

Bradley Minnich's personal headquarters: a serious core with a personality layer.

The site is intentionally broader than a résumé, portfolio, influencer page, or corporate biography. It connects operations, businesses, media, software, New Hampshire land / real estate work, social projects, and future partnerships without turning them into five different websites.

## Pages

- / — homepage and the central story
- /work/ — filterable project and role index
- /about/ — background, career timeline, working style, and interests
- /collaborate/ — collaboration opportunities and inquiry form
- /sponsor/ — sponsorship / partnership positioning and request form
- /contact/ — general inquiries, recruiting, media, collaboration, and sponsorship routing
- /shop/ — live made-to-order merch storefront
- /404.html — branded not-found page

The Shop route links to the live Fourthwall storefront, where products are made to order and fulfillment is handled outside the GitHub Pages site.

## Architecture

This is a dependency-free static site with an optional Cloudflare Pages Function for forms.

- assets/site-data.js is the centralized content source for projects, current work, career history, expertise, social links, partnership formats, and sponsor inventory.
- assets/app.js renders data-driven sections, filters projects, handles navigation, submits forms, and loads optional analytics / Turnstile configuration.
- assets/styles.css contains the visual system and responsive layout.
- functions/api/contact.js validates and sends form submissions through Resend without exposing secrets client-side.
- scripts/check-site.mjs is the build / test check used by GitHub Actions.
- assets/social-card.svg is the reusable Open Graph / X social card.
- shop/index.html is the editorial storefront bridge to the hosted Fourthwall catalog.
- sitemap.xml, robots.txt, canonical tags, structured data, and page metadata are included for SEO.

The public profile portrait is stored at assets/media/bradley-minnich.jpg and used on the homepage and About page. Keep personal imagery intentional, optimized, and paired with meaningful alt text. Verified claims should be added only when they are ready.

## Run, build, and test

No package installation is required.

~~~bash
npm run build
npm test
~~~

Both commands run the static validation script. GitHub Actions also checks JavaScript syntax for the browser code and form handler.

To preview the static site locally, use any static server from the repository root, for example:

~~~bash
python3 -m http.server 8080
~~~

The form endpoint will not send email from a plain static server unless the Cloudflare Pages Function is deployed with the required environment variables.

## Updating content

Edit assets/site-data.js:

- Add or update projects in projects.
- Add current work to currentProjects.
- Update the career timeline in career.
- Update public social links in socialLinks.
- Update areas of expertise in expertise.
- Update partnership formats in sponsorFormats.

The project page filter buttons use the tags array, so use the existing category names when adding a filterable project.

## Adding photos and media

When verified Bradley or project photos are available:

1. Add optimized files under assets/media/.
2. Use descriptive filenames and meaningful alt text.
3. Keep large originals out of the repository.
4. Add the image to the relevant page or data object.
5. Update assets/social-card.svg only if the social preview direction should change.

The current design uses typography, layout, and Bradley’s supplied profile portrait instead of generic stock photography.

## Forms and email

The collaboration, sponsorship, and general contact forms POST to /api/contact.

The handler uses:

- Resend for email delivery
- Environment variables for all secrets
- Server-side validation and length limits
- A honeypot field
- Optional Cloudflare Turnstile verification
- Reply-to set to the visitor's submitted email

Required Cloudflare Pages environment variables:

- RESEND_API_KEY — Resend API key
- CONTACT_FROM_EMAIL — a verified Resend sender, such as Bradley Website <hello@bradleyminnich.com>
- CONTACT_TO_EMAIL — defaults to bradleymminnich@gmail.com; set explicitly to confirm the destination

Optional anti-spam configuration:

- TURNSTILE_SECRET_KEY — Cloudflare Turnstile secret
- Set site.turnstileSiteKey in assets/site-data.js to the matching public site key

If the form endpoint is unavailable or not configured, the UI presents a direct email fallback. Do not commit keys, SMTP passwords, or provider credentials.

## Analytics

Analytics is off by default. To use Plausible, set site.plausibleDomain in assets/site-data.js to the verified domain. No analytics ID is invented or committed.

Cloudflare Web Analytics can be added at the hosting layer without changing the site data.

## Sponsor and ad inventory

No fake ads are displayed.

To activate a tasteful sponsor placement, add an object to adSlots in assets/site-data.js:

~~~js
{
  advertiser: "Verified partner",
  destinationUrl: "https://example.com",
  altText: "Short description",
  placement: "home-featured",
  active: true
}
~~~

Supported reserved placements currently include home-featured and sponsor-featured. Keep sponsorships clearly labeled.

## Future shop / merch

The shop is live at https://bradthefunman-shop.fourthwall.com/. The first drop includes:

- Bradley Minnich Portrait Tee — https://bradthefunman-shop.fourthwall.com/products/bradley-minnich-portrait-tee
- Bradley Minnich Build Further Sweatshirt — https://bradthefunman-shop.fourthwall.com/products/bradley-minnich-build-further-sweatshirt

Fourthwall is the operational source of truth for product availability, checkout, fulfillment, shipping, customer support, and returns. The GitHub Pages site only maintains the Shop landing page and links, so product orders do not require website edits.

## Deployment and custom domain

The repository has a CNAME file for bradleyminnich.com and a .nojekyll file for static asset paths.

### Current DNS state (verified 2026-09-14)

The custom domain is connected to GitHub Pages.

- Apex A records: 185.199.108.153, 185.199.109.153, 185.199.110.153, and 185.199.111.153
- www CNAME: bradthefunman.github.io
- GitHub Pages custom-domain status: DNS check successful
- Enforce HTTPS: enabled
- www redirects to the canonical non-www domain

Live site: https://bradleyminnich.com/

### GitHub Pages

The site is deployed from the main branch and the custom domain is configured in repository Settings → Pages. Keep the root CNAME file and .nojekyll file in place when making future changes.

GitHub Pages can serve the static site, but it cannot execute functions/api/contact.js. Forms use the direct-email fallback until the same source is deployed to a host with serverless functions and the required environment variables.

GitHub Pages preview: https://bradthefunman.github.io/BradleyMinnich.com/

### Cloudflare Pages (optional when forms must work)

1. Connect this repository to Cloudflare Pages.
2. Use npm run build as the build command and the repository root (.) as the output directory.
3. Add the form environment variables above in the Pages project.
4. Add bradleyminnich.com as the custom domain in Cloudflare Pages.
5. Verify the preview deployment before changing hosting or DNS.
6. After the domain is live, test every form, HTTPS, the root domain, and the www behavior.

Do not re-add Squarespace forwarding records; they would override the GitHub Pages connection.

## SEO and accessibility

Each page includes:

- Unique title and meta description
- Canonical non-www URL
- Open Graph and X metadata
- Structured data on the homepage
- Semantic headings and labels
- Visible keyboard focus states
- Skip link
- Reduced-motion support
- Responsive layout for desktop, tablet, and mobile
- Sitemap and robots rules

Run npm test before every publish.
