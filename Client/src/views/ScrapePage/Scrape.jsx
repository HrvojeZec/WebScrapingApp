import React from "react";
import classes from "../../assets/stylesheets/scrape.module.scss";
import { useProductsData } from "../../stores/GetAllProducts";
import Slider from "react-slick";
function Scrape() {
  const { data: Products } = useProductsData();
  const images = Products.map((product) => {
    return product.images;
  });
  const mergeImages = images.reduce((acc, curr) => acc.concat(curr), []);
  const handleScrape = () => {};
  const handleLoadFromDatabase = () => {};
  const settings = {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    speed: 1000,
    autoplaySpeed: 4000,
    cssEase: "linear",
  };
  return (
    <div className={classes.scrape}>
      <div className={classes.scrape__wrapper}>
        <div className={classes.scrape__content} data-aos="fade-right">
          <div className={classes.content__upper}>
            <h1>
              Otkrijte najbolje ponude uz{" "}
              <span className={classes.upper__Smart}>Smart</span>
              <span className={classes.upper__Shop}>Shop</span>
            </h1>
            <p>
              Moćna platforma za analizu proizvoda i rasta koja vam pomaže u
              pretraživanju više trgovina, uključujući Mall i Sancta Domenica.
            </p>
          </div>
          <div className={classes.content__input}>
            <input
              className={classes.input}
              type="text"
              placeholder="Unesite proizvod koji tražite..."
            />
            <div className={classes.button__wrapper}>
              <button
                className={classes.button__scrape}
                type="button"
                onClick={handleScrape}
              >
                Pokreni scrapanje
              </button>
              <button
                className={classes.button__LoadFromDatabase}
                type="button"
                onClick={handleLoadFromDatabase}
              >
                Učitaj proizvode
              </button>
            </div>
          </div>
        </div>
        <div className={classes.image__content} data-aos="fade-left">
          <div className="slider-container">
            <Slider {...settings}>
              {mergeImages.map((image, index) => (
                <div key={index}>
                  <img src={image} alt={`Slika ${index}`} />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Scrape;
