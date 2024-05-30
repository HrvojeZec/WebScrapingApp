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

  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get("keyword") || "";
  const operation = searchParams.get("operation") || "";
  const scrapeId = searchParams.get("scrapeId") || "";

  const handlePageChange = (newPage) => {
    setActivePage(newPage);
  };

  let url = "";
  if (operation === "scrape") {
    url = `${constants.apiUrl}/api/products/scrapeId?scrapeId=${scrapeId}`;
  } else if (operation === "load") {
    url = `${constants.apiUrl}/api/products/keyword?keyword=${keyword}`;
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;
        if (operation === "scrape") {
          response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
        } else if (operation === "load") {
          response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
        }
        if (!response.ok) {
          const errorData = await response.json();
          const messageError = errorData.message;
          showLoadingDataNotification(false);
          showErrorNotification({ message: messageError });
          setLoading(false);
          return;
        }
        const data = await response.json();
        setData(data);
        setShowProductList(data);
        setDataLength(data.length);
      } catch (error) {
      } finally {
        showLoadingDataNotification(false);
        setLoading(false);
      }
    };
    if (keyword || scrapeId) {
      fetchData();
    }
  }, [keyword, operation, scrapeId]);

  const handleSortLowToHigh = () => {
    const sortedProducts = [...data].sort(
      (a, b) =>
        parseFloat(a.price.replace(" €", "").replace(".", "")) -
        parseFloat(b.price.replace(" €", "").replace(".", ""))
    );

    setShowProductList(sortedProducts);
  };

  const handleSortHighToLow = () => {
    const reverseSortedProducts = [...data].sort(
      (a, b) =>
        parseFloat(b.price.replace(" €", "").replace(".", "")) -
        parseFloat(a.price.replace(" €", "").replace(".", ""))
    );

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
