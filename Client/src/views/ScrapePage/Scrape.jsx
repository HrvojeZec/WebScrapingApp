import React, { useEffect, useState } from "react";
import classes from "../../assets/stylesheets/scrape.module.scss";
import { useProductsData } from "../../stores/GetAllProducts";
import Slider from "react-slick";
import { LoaderGlobal } from "../../components/shared/Loader/Loader";
function Scrape() {
  const [keyword, setKeyword] = useState("");
  const [data, setData] = useState();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const { data: Products } = useProductsData();
  const images = Products.map((product) => {
    return product.images;
  });
  const mergeImages = images.reduce((acc, curr) => acc.concat(curr), []);
  const handleScrape = () => {
    console.log(keyword);
  };
  const handleLoadFromDatabase = async (event) => {
    event.preventDefault();
    console.log(keyword);
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/products/keyword?keyword=${keyword}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData);
      }
      setError(null);
      const res = await response.json();
      setData(res);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  console.log("učitani proizvodi iz baze:", data);
  const settings = {
    infinite: true,
    fade: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    speed: 1000,
    autoplaySpeed: 4000,
    arrows: false,
    cssEase: "linear",
  };
  return (
    <>
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
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
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
            <div className={classes.slider__container}>
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
      {loading && <LoaderGlobal />}
    </>
  );
}

export default Scrape;
