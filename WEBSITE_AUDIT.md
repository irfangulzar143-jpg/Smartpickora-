# SmartPickora — Website Audit & Launch Checklist
Last reviewed: 2026-10-20

## Current status
- Static website hosted on GitHub Pages: https://irfangulzar143-jpg.github.io/Smartpickora-/
- Repository: https://github.com/irfangulzar143-jpg/Smartpickora-
- The site has a responsive shared header/footer, category browsing, demo product cards, search, price filters, sorting, comparison tools, About, Contact, Privacy Policy, Terms, Affiliate Disclosure, robots.txt and sitemap.xml.
- A featured Dokotoo dress listing is linked from fashion-picks.html using the supplied Amazon URL and Associate ID tag `smartpickorau-20`.
- Amazon link tracking and final Associates approval have NOT been independently confirmed.
- GA4 integration code is prepared in js/layout.js, but analytics is OFF until the real Measurement ID is entered.

## Critical before promotion
1. Replace demo catalogue items with real, researched products. The catalogue in js/products.js deliberately has null prices and ratings, demo descriptions, sample pros/cons and placeholder images. Do not present those as genuine reviews or product recommendations.
2. Keep the Amazon disclosure visible. Required wording: "As an Amazon Associate I earn from qualifying purchases." A short disclosure such as "(paid link)" should be near each affiliate link.
3. Verify every affiliate link and its tag in Amazon Associates Central. A tagged URL alone does not prove account approval or a recorded commission.
4. Do not manually invent or guess Amazon prices, ratings, review counts, stock, images or specifications. Check current product data against Amazon's current rules; use permitted Amazon tools/data sources where applicable.
5. Add a real contact email and connect the contact form. Currently CONTACT_EMAIL in js/pages.js is blank; the form truthfully reports that messages are not sent.
6. Complete and review the Privacy Policy and Terms. They are currently marked as draft templates; update them to accurately describe the final analytics, cookies, hosting and contact setup.

## SEO review
- Basic titles, meta descriptions, canonical URLs and Open Graph tags exist on many pages.
- robots.txt points to sitemap.xml; the sitemap contains absolute URLs on the current GitHub Pages host.
- The canonical host is currently the GitHub Pages URL, not a custom SmartPickora domain. If a custom domain is purchased and connected, update canonical tags, Open Graph URLs, sitemap URLs and Search Console properties consistently.
- Submit the sitemap in Google Search Console and inspect the homepage, fashion collection, fashion shortlist and important guides using URL Inspection.
- A sitemap helps discovery; it does not guarantee indexing or ranking.
- Improve page-by-page unique titles/descriptions, descriptive headings, internal links, image alt text and useful original content.
- Do not publish thin, repetitive, auto-generated product pages merely to target keywords. Write original comparisons with evidence, use cases, limitations, methodology and update dates.
- Run PageSpeed Insights and mobile checks after changes; this code audit does not constitute a live Lighthouse, accessibility or Core Web Vitals test.

## Google Analytics 4 setup
1. Create/select a GA4 property at https://analytics.google.com/.
2. Add a Web data stream for the exact live site URL.
3. Copy the Measurement ID (format `G-XXXXXXXXXX`).
4. Edit `GA_MEASUREMENT_ID` near the top of `js/layout.js` and replace the empty string with that ID.
5. Commit the change, wait for GitHub Pages deployment, then check GA4 Realtime while visiting the site.
6. Test an Amazon button. The code sends a custom `affiliate_click` event for links carrying `rel="sponsored"`. Verify this event in GA4 DebugView/Realtime before relying on it.
7. Update the privacy policy before enabling analytics, and assess whether consent controls are required for your audience and applicable laws.

## Add another Amazon product safely
1. In Amazon Associates Central, find the exact product and generate/copy a Special Link using the correct store/Associate ID.
2. Confirm the ASIN, title, exact product/variation, seller and URL. Do not copy an unrelated listing.
3. Add the product to a relevant editorial page, with original helpful commentary and clear limitations.
4. Put a clear "(paid link)" or equivalent disclosure near its button and retain the site-wide required Associate statement.
5. Use a direct, transparent Amazon URL; do not obscure the destination or use misleading button text.
6. Test the button on mobile and desktop. Check the final destination and tag. Commission reporting may be delayed and is subject to Amazon's terms.

## Suggested order of work
P0 — Replace demo content on any pages you intend to promote; verify affiliate link and disclosure; add contact email; finish legal pages.
P1 — Set up GA4 using the real Measurement ID; create/verify Google Search Console; submit sitemap; inspect indexing.
P2 — Build 5–10 high-quality original product comparison pages in one focused category; add real internal links and clear update dates.
P3 — Check mobile usability, performance, broken links, keyboard navigation and image handling; review Search Console and GA4 weekly.

## Important limitations
This is a code/repository review based on the accessible repository files. It does not confirm Amazon's private account status, live click tracking, actual GA4 collection, Google indexing, DNS/custom-domain status, real-time product prices, or live performance scores. Those require account dashboards and live testing.
