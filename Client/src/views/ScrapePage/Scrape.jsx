import React, { useState } from "react";
import classes from "../../assets/stylesheets/scrape.module.scss";
import { useProductsData } from "../../stores/GetAllProducts";
import Slider from "react-slick";
import { LoaderGlobal } from "../../components/shared/Loader/Loader";
import { ProductCard } from "./ProductCard";
import { Pagination, Text } from "@mantine/core";
import { ContactPage } from "../ContactPage/ContactPage";
import { errorNotification } from "../../components/shared/Notification/Notification";
function Scrape() {
  const [keyword, setKeyword] = useState("");
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [dataLength, setDataLength] = useState();
  const [activePage, setActivePage] = useState(1);
  const [productsPerPage] = useState(15);
  const { data: Products } = useProductsData();
  const images = Products.map((product) => {
    return product.images;
  });
  const mergeImages = images.reduce((acc, curr) => acc.concat(curr), []);
  const handleScrape = () => {
    console.log(keyword);
  };
  const totalPages = Math.ceil(dataLength / productsPerPage);
  const handlePageChange = (newPage) => {
    setActivePage(newPage);
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
        const messageError = errorData.message;
        console.log(errorData);
        errorNotification({ message: messageError });
      }

      const res = await response.json();
      setDataLength(res.length);
      console.log(res);
      setData(res);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

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

      {data && <div>{keyword}</div>}
      <div className={classes.card__wrapper}>
        {data &&
          data
            .slice(
              (activePage - 1) * productsPerPage,
              activePage * productsPerPage
            )
            .map((product, index) => (
              <ProductCard
                key={index}
                productId={product._id}
                name={product.title}
                description={product.description}
                price={product.price}
                images={product.images}
                logo={product.logo}
                oldPrice={product.oldPrice}
                link={product.link}
                length={product.length}
              />
            ))}
      </div>
      <div className={classes.pagination__wrapper}>
        {data && (
          <Pagination
            total={totalPages}
            value={activePage}
            onChange={handlePageChange}
            mt="sm"
          />
        )}
      </div>

      <ContactPage />
    </>
  );
}

export default Scrape;
