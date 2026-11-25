# Data sources

StoreSeeker reads public category listings of Croatian web shops to compare prices and keep a price
history. Before a shop is added, its terms of use and its `robots.txt` are read in full. A shop whose
terms forbid this use, or are unclear about it, is not added.

What every adapter follows:

- An honest User-Agent, `StoreSeekerBot/<version> (+https://github.com/HrvojeZec/WebScrapingApp)`,
  without stealth plugins, fake browsers or workarounds for 403, 429 or challenge pages.
- `robots.txt` is checked before every request. Search pages are never requested.
- At most one request per shop every 5 seconds, with a pause on 429 and backoff on server errors.
- Only these fields are stored: product title, price, regular price, product URL, image URL,
  availability and EAN (when the listing shows it). Images are linked, never copied. Product
  descriptions are not stored.
- Crawls run from one home machine, twice a day on a schedule or when a user asks for fresh prices
  (at most once per category every 30 minutes).

## Harvey Norman (harveynorman.hr)

Checked on 25 November 2026.

### Terms

- General terms: <https://www.harveynorman.hr/opci-uvjeti-poslovanja> links to the web shop terms,
  <https://www.harveynorman.hr/opci-uvjeti-poslovanja-web-trgovina> (dated 1 January 2024), plus
  separate terms for the physical stores and for kitchens.
- **Conclusion: allowed.** The web shop terms cover only the sale between the shop and a buyer:
  ordering, prices, payment, delivery, warranty, returns, personal data and disputes. They contain
  no clause on copying site content, using it on other websites, intellectual property, automated
  access or "personal use only".
- Relevant wording:
  - 3.1: "Opći uvjeti primjenjuju se između Kupca i trgovačkog društva Harvey Norman d.o.o. […]
    vezano uz naručivanje proizvoda od strane Kupca putem internet trgovine" (the terms apply
    between the buyer and the shop, to ordering products).
  - 3.5: "Opisi i specifikacije proizvoda dobiveni su od strane dobavljača […]. Fotografije
    proizvoda mogu biti dobivene od strane dobavljača" (descriptions and photos come from
    suppliers). StoreSeeker stores neither descriptions nor image files.
  - 3.10: "Ponuda vrijedi za narudžbe u količinama primjerenim za kućanstvo odnosno osobnu
    upotrebu" (the offer is for household quantities). This limits order sizes, not the use of
    the website.
  - 3.18: during a sale the shop shows the lowest price of the 30 days before the sale, as the law
    requires. StoreSeeker's inflated-sale flag uses the same 30-day rule on its own history.

### robots.txt

<https://www.harveynorman.hr/robots.txt> has one group, `User-agent: *`. Rules that matter here:

- `Disallow: /catalogsearch/`: search pages. StoreSeeker searches its own database instead.
- `Disallow: /catalog/product/view/`: some listing links use this path. StoreSeeker stores the
  link but never requests it.
- `Disallow` for sorting, filters and page size (`product_list_order`, `product_list_mode`,
  `product_list_limit`, `product_list_dir`, `?cat=`, `?price=`, `ow_` parameters). StoreSeeker
  only uses the default listing and its `?p=N` pages, which are allowed.

### What is crawled

The listing is plain HTML (Magento), so no browser is needed. It shows 10 products per page and
lists only products that can be bought, so a product is available while a complete crawl lists it.
The listing has no EAN.

| Category   | Listing URLs                                                           | Pages on 25.11.2026               |
| ---------- | ---------------------------------------------------------------------- | --------------------------------- |
| Mobiteli   | `/mobiteli/smartphone/mobiteli`, `/mobiteli/apple-smartphone/mobiteli` | 14 for both listings (104 phones) |
| Laptopi    | `/informatika/laptopi`                                                 | 8                                 |
| Televizori | `/televizori-i-audio/televizori` (includes projectors)                 | 20                                |
| Tableti    | `/informatika/tableti-i-e-citaci/tableti`                              | 3                                 |
| Slušalice  | `/mobiteli/slusalice`                                                  | 2                                 |

A full crawl was 47 pages and 422 products in 4 minutes on 25.11.2026, at one request every 5 seconds.
