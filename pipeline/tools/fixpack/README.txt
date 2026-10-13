FunPlay Systems – SEO Fix Pack (5 Oct 2026)
===========================================
Read FunPlay-Technical-SEO-Report.docx first (sections 1 and 12).

script/apply_seo_fixes.py + fixpack-data.json
    Run on a COPY of public_html:
    python3 script/apply_seo_fixes.py --site ./public_html --out ./public_html_fixed
    Review public_html_fixed/_change-log.csv, test, then upload.

htaccess-redirects.txt        Paste at the top of .htaccess (back it up first)
cloudflare-rules.txt / .csv   Only if Cloudflare is proxied (orange cloud)
robots.txt, llms.txt, ai.txt  Upload to the site root
sitemaps/*.xml                Upload to the site root; delete sitemap-index.xml; submit sitemap.xml in Search Console + Bing
new-pages/*.html              3 new state hub pages – upload to the site root
schema/                       JSON-LD the script inserts (templates for new pages)
snippets/                     Our Network and state-hub link blocks the script inserts
