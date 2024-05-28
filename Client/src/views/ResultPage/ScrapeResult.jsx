import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CardTitleWithSort } from "./CardTitleWithSort";
import { ProductCard } from "./ProductCard";
import { LoaderGlobal } from "../../components/shared/Loader/Loader";
import { constants } from "../../config/constants";
import { Pagination } from "@mantine/core";
import classes from "../../assets/stylesheets/scrape.module.scss";
import {
  showErrorNotification,
  showLoadingDataNotification,
} from "../../components/shared/Notification/Notification";
function ScrapeResult() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [showProductList, setShowProductList] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [productsPerPage] = useState(15);
  const [dataLength, setDataLength] = useState(0);
  const totalPages = Math.ceil(dataLength / productsPerPage);

  // Extract keyword and operation from URL
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get("keyword") || "";
  const operation = searchParams.get("operation") || "";

  const handlePageChange = (newPage) => {
    setActivePage(newPage);
  };

  //TO DO: UVESTI KEYWORD PROVIDER DA SE NE POJAVLJUJE ISTI FETCH DVA PUTA NA DVIJE RAZLICITE STRANE
  //TO DO: OVDJE DOHVACAMO DATA,ERROR,LOADER OD PROVIDERA
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;
        if (operation === "scrape") {
          response = await fetch(`${constants.apiUrl}/api/scrape`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keyword }),
          });
        } else if (operation === "load") {
          response = await fetch(
            `${constants.apiUrl}/api/products/keyword?keyword=${keyword}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.log(errorData);
          const messageError = errorData.message;
          showLoadingDataNotification(false);
          showErrorNotification({ message: messageError });
          setLoading(false);
          return;
        }

        const successData = await response.json();
        const data = successData;

        console.log(data);
        setData(data);
        setShowProductList(data);
        setDataLength(data.length);
      } catch (error) {
      } finally {
        showLoadingDataNotification(false);
        setLoading(false);
      }
    };

    if (keyword) {
      fetchData();
    }
  }, [keyword, operation]);
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
    <div className={classes.scrapeResult}>
      {loading && <LoaderGlobal />}
      {data.length > 0 && (
        <CardTitleWithSort
          handleSortLowToHigh={handleSortLowToHigh}
          handleSortHighToLow={handleSortHighToLow}
          keyword={keyword}
        />
      )}
      <div className={classes.card__wrapper}>
        {showProductList.length > 0 &&
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
        {data.length > 0 && (
          <Pagination
            total={totalPages}
            value={activePage}
            onChange={handlePageChange}
            mt="sm"
          />
        )}
      </div>
    </div>
  );
}

export default ScrapeResult;
