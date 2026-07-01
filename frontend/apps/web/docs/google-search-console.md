# Google Search Console handoff

## Production prerequisites

- Set `NEXT_PUBLIC_SITE_URL` or `SITE_URL` to the final production domain.
- Confirm `/robots.txt` points to the same final domain.
- Confirm `/sitemap.xml` does not include noindex placeholder pages.
- Confirm legal policy pages are final before changing their CMS `metadata.noindex` to `false`.

## Submit sitemap

1. Open Google Search Console for the verified production property.
2. Go to **Indexing > Sitemaps**.
3. Submit `https://<production-domain>/sitemap.xml`.
4. Re-submit after major route/content launches such as blog categories, tour pages, or new public store/cast batches.

## Smoke checks before submit

```bash
curl -I https://<production-domain>/robots.txt
curl -I https://<production-domain>/sitemap.xml
curl https://<production-domain>/sitemap.xml | findstr /i "tour legal"
```

Expected until PM/legal sign-off: `tour` and `legal` detail URLs are absent from sitemap.
