//////////////////////////////////////////////////
MALL

input -----> id = site-search-input

button ----> id = search-button class = site-search**content**button

class = category-product
class = pbcr
class = pb-brief
class = pb-brief**title-wrap  
 class = pb-brief**title (title)
class = pb-brief**brief
p element (opis)
class = pb-price
a href (link)
class = pb-price**price
span (cijena)
class = pb-gallery
class = gallery-list
a
class = gallery-list**carousel
class = hooper-list
ul element, class = hooper-track
li element, class = hooper-slide
class = gallery-list**wrap
img class = gallery-list\_\_image (slika)

pbcr-availability
p innerText.HTML

{
title:
opis:
cijena:
slika:
link:
}

body
class = **nuxt
class = **layout
id = main-template
id = page-content
class = main-content
div
class = container
class = search\_\_right
div
class = search-products-wrap
class = category-products

kod linkova moram staviti ovo https://www.mall.hr ovaj drugi dio imam /apple-iphone-14/apple-iphone-14-mobilni-telefon-256gb-blue-mpwp3yc-a

1. input.amsearch-input
2. enter
3. cekaj da se ucitaju podatci
4. dohvacanje podataka
   ol class = product-items
   li class = product-item

   image --> .product-item-photo-wrapper img[src]
   link/title --> a.product-item-link innerText.HTML / .product-item-name a[href]
   opis --> .product-item-description innerText.HTML
   cijena --> .price innerText
   logo --> a.logo img[src]
   keyword

5. stranica nema dinamicko ucitavanje nego moramo dohvatiti paginaciju button
   -postavi zadnju stranicu na false ,
   - dohvati paginaciju ------------------------------------------------> li pages-item-next a.action.next
   - ako nema vise paginacije dosli smo na zadnju stranicu postavi true
   - u suprotnom klikni na paginaciju
   - cekaj da se podatci ucitaju,
   - scrapaj stranicu

ul class = pages-items
li class = pages-item-next
a class = action next

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
puppeteer funkcije

// scrollaj do dole kod
let prevHeight = -1;
let maxScrolls = 100;
let scrollCount = 0;

while (scrollCount < maxScrolls) {
// Scroll to the bottom of the page
await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
// Wait for page load

    // Calculate new scroll height and compare
    let newHeight = await page.evaluate("document.body.scrollHeight");
    if (newHeight == prevHeight) {
      break;
    }
    prevHeight = newHeight;
    scrollCount += 1;

}

/////cekaj dok ne nades selector
//await page.waitForSelector(".someselector"); !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ne radi vise wait for selecotr nego ide
await new Promise((resolve) => setTimeout(resolve, 3000));
/////////////// prije searcha treba pricekati da se search pojavi , treba ubacit setTimeout prije searcha
///////////////////// kako da dohvatimo search i pretrazimo stranicu preko key worda

await page.type('#mytextarea', 'World', {delay: 100});

    #mytextarea search ID , neka rijeci, delay da se cini da je covjek kucao





    //////////////// puppeteer 19.5.2 ako bude problema


    //////////////////// kada smo unjeli u search  key word treba kliknuti na search button a to je
    const [response] = await Promise.all([
         page.waitForNavigation(waitOptions),
         page.click(selector, clickOptions),
      ])

//////////////////////// iz nekog razloga clikc() ne radi na ovaj nacin ili koristiti enter ili koristiti ovaj nacin
await page.evaluate(() => {
document.querySelector("selector").click();
});
await page.keyboard.press("Enter"),
//////////////////////// jos jedan nacin pretrazivanja

---- dohvatim btn element
---- stavim wait for selector btn
---- tek onda ukucavam search
---- i onda samo btn.click()
---- nakon klika moramo stavit wait for data( table ili bilo sta drugo di su podatci)

////////////scroll
const delay = 1000; // Postavite željeni vremenski interval između koraka (u milisekundama)
// Scroll to the bottom of the page
await page.evaluate(async (delay) => {
const scrollToBottom = async (delay) => {
const delayPromise = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
while (window.scrollY < document.body.scrollHeight) {
window.scrollTo(0, window.scrollY + 100); // Postavite željeni korak scrollanja
await delayPromise(delay);
}
};
await scrollToBottom(delay);
}, delay);

// Main scroll loop
const scrollHeight = await page.evaluate(() => document.body.scrollHeight);

while (scrollCount < maxScrolls) {
// Check if the button--loading element exists
const isLoading = await page.evaluate(() =>
document.querySelector(".button--loading")
);

    // If the button--loading element exists, break the loop
    if (isLoading) {
      console.log("Loading in progress. Stopping scrolling.");
      break;
    }

    // Check if the button element exists and click on it
    const buttonExists = await page.evaluate(() =>
      document.querySelector(".button__wrapper")
    );

    if (buttonExists) {
      await page.click(".button__wrapper");
      console.log("Clicked on button");
    }

    const imgsSelector = ".gallery-list__wrap img[src]";
    await page.waitForSelector(imgsSelector);

    let currentScroll = 0;
    while (currentScroll < scrollHeight) {
      // Scroll to the next position
      await page.evaluate(
        (scrollHeight, currentScroll) => {
          window.scrollTo({
            top: currentScroll + 500,
            behavior: "smooth",
          });
        },
        scrollHeight,
        currentScroll
      );

      // Wait for a short time to allow content to load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      currentScroll += 500;
    }

    // Calculate new scroll height and compare
    let newHeight = await page.evaluate("document.body.scrollHeight");
    console.log("new Height: ", newHeight);
    console.log("prevHeight: ", prevHeight);
    if (newHeight == prevHeight) {
      console.log("Reached end of page");
      break;
    }
    prevHeight = newHeight;
    scrollCount += 1;

}

products
