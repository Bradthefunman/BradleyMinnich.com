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
- /404.html — branded not-found page

The shop / merch navigation remains hidden until real products exist.

## Architecture

This is a dependency-free static site with an optional Cloudflare Pages Function for forms.

- assets/site-data.js is the centralized content source for projects, current work, career history, expertise, social links, partnership formats, and sponsor inventory.
- assets/app.js renders data-driven sections, filters projects, handles navigation, submits forms, and loads optional analytics / Turnstile configuration.
- assets/styles.css contains the visual system and responsive layout.
- functions/api/contact.js validates and sends form submissions through Resend without exposing secrets client-side.
- scripts/check-site.mjs is the build / test check used by GitHub Actions.
- assets/social-card.svg is the reusable Open Graph / X social card.
- sitemap.xml, robots.txt, canonical tags, structured data, and page metadata are included for SEO.

No personal photos or fabricated metrics are included. Add verified images and claims when they are ready.

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

The current design uses typography and layout instead of generic stock photography.

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

The shop is intentionally not in the main navigation yet. When real products exist, add a shop/ route and connect it to a print-on-demand or commerce provider without changing the project / content architecture.

## Deployment and custom domain

The repository has a CNAME file for bradleyminnich.com and a .nojekyll file for static asset paths.

### Current DNS state (verified 2026-09-14)

The new site is deployed and verified at https://bradthefunman.github.io/BradleyMinnich.com/. The public custom domain has not been switched yet: bradleyminnich.com still resolves to the existing Google Sites setup (ghs.googlehosted.com plus the current legacy A records), so the old public site remains live until the DNS cutover.

This was left unchanged to avoid breaking the current domain without access to the DNS provider. Do not remove the old records until the replacement host is verified.

Static deployment options:

### GitHub Pages

1. In repository Settings → Pages, confirm the GitHub Pages deployment has succeeded and set the custom domain to bradleyminnich.com.
2. At the DNS provider, replace the existing Google Sites records with the exact GitHub Pages records shown by GitHub for this repository. Do not guess or hard-code IPs; GitHub may update them.
3. Configure the www hostname exactly as GitHub instructs, enable HTTPS, and confirm the root / www redirect behavior.
4. Re-test DNS with dig, then check https://bradleyminnich.com/ and every navigation route.
5. If working server-side forms are required, deploy the same source to Cloudflare Pages before or alongside the DNS cutover; GitHub Pages serves the direct-email fallback but cannot execute functions/api/contact.js.

GitHub Pages preview: https://bradthefunman.github.io/BradleyMinnich.com/

### Cloudflare Pages (recommended when forms must work)

1. Connect this repository to Cloudflare Pages.
2. Use npm run build as the build command and the repository root (.) as the output directory.
3. Add the form environment variables above in the Pages project.
4. Add bradleyminnich.com as the custom domain in Cloudflare Pages.
5. Verify the preview deployment before changing any DNS records serving the current site.
6. After the domain is live, test every form, HTTPS, the root domain, and the www behavior.

Do not delete or change the existing live DNS / hosting records until the replacement is deployed and verified.

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
