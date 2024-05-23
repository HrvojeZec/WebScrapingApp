import React, { useState } from "react";
import classes from "../../assets/stylesheets/scrape.module.scss";
import { LoaderGlobal } from "../../components/shared/Loader/Loader";
import { ProductCard } from "./ProductCard";
import { Pagination } from "@mantine/core";
import { ContactPage } from "../ContactPage/ContactPage";
import {
  showErrorNotification,
  showLoadingDataNotification,
} from "../../components/shared/Notification/Notification";
import { constants } from "../../config/constants";
import { SliderComponent } from "./Slider";
import { SmartShopText } from "../../components/shared/BrandLogo/SmartShop";
import { CardTitleWithSort } from "./CardTitleWithSort";

function Scrape() {
  const [keyword, setKeyword] = useState("");
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [dataLength, setDataLength] = useState();
  const [activePage, setActivePage] = useState(1);
  const [showProductList, setShowProductList] = useState();
  const [productsPerPage] = useState(15);

  const totalPages = Math.ceil(dataLength / productsPerPage);
  const handlePageChange = (newPage) => {
    setActivePage(newPage);
  };

  const handleScrape = async (event) => {
    console.log(keyword);
    event.preventDefault();
    if (keyword.length > 3) {
      showLoadingDataNotification(true);
    }
    try {
      const response = await fetch(`${constants.apiUrl}/api/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: keyword,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        const messageError = errorData.message;
        showLoadingDataNotification(false);
        showErrorNotification({ message: messageError });
      }

      const successData = await response.json();
      console.log(successData);
      const data = successData.data;
      console.log(data);
      setData(data);
      setShowProductList(data);
    } catch (error) {
    } finally {
      showLoadingDataNotification(false);
    }
  };

  const handleLoadFromDatabase = async (event) => {
    event.preventDefault();
    console.log(keyword);
    try {
      setLoading(true);
      const response = await fetch(
        `${constants.apiUrl}/api/products/keyword?keyword=${keyword}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        const messageError = errorData.message;
        console.log(errorData);
        showErrorNotification({ message: messageError });
      }

      const res = await response.json();
      console.log(res);
      setDataLength(res.data.length);
      setData(res.data);
      setShowProductList(res.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const handleSortLowToHigh = () => {
    console.log("low to high");
    const sortedProducts = [...data].sort(
      (a, b) =>
        parseFloat(a.price.replace(" €", "").replace(".", "")) -
        parseFloat(b.price.replace(" €", "").replace(".", ""))
    );
    console.log("sorted: ", sortedProducts);
    setShowProductList(sortedProducts);
  };

  const handleSortHighToLow = () => {
    console.log("high to low");
    const reverseSortedProducts = [...data].sort(
      (a, b) =>
        parseFloat(b.price.replace(" €", "").replace(".", "")) -
        parseFloat(a.price.replace(" €", "").replace(".", ""))
    );
    console.log("sorted: ", reverseSortedProducts);
    setShowProductList(reverseSortedProducts);
  };
  return (
    <>
      <div className={classes.scrape}>
        <div className={classes.scrape__wrapper}>
          <div className={classes.scrape__content} data-aos="fade-right">
            <div className={classes.content__upper}>
              <SmartShopText />
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
          <SliderComponent />
        </div>
      </div>

      {loading && <LoaderGlobal />}

      {data && (
        <CardTitleWithSort
          handleSortLowToHigh={handleSortLowToHigh}
          handleSortHighToLow={handleSortHighToLow}
          keyword={keyword}
        />
      )}
      <div className={classes.card__wrapper}>
        {showProductList &&
          showProductList
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
                updatedAt={product.updatedAt}
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
