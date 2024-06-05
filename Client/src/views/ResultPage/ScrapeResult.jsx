import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { Title, Text, Button, Container, Group } from "@mantine/core";
import { Link } from "react-router-dom";
function useCurrentURL() {
  const location = useLocation();
  const params = useParams();

  return {
    pathname: location.pathname,
    search: location.search,
    params,
  };
}
function ScrapeResult() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [showProductList, setShowProductList] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [productsPerPage] = useState(15);
  const [dataLength, setDataLength] = useState(0);
  const { pathname, search, params } = useCurrentURL();

  console.log(
    `Current path is ${pathname} with search ${search} and params`,
    params
  );

  const totalPages = Math.ceil(dataLength / productsPerPage);

  const handlePageChange = (newPage) => {
    setActivePage(newPage);
  };

  let url = "";
  url = `${constants.apiUrl}/api/products/keyword?keyword=${params.keyword}`;
  useEffect(() => {
    const fetchData = async () => {
      console.log(url);
      console.log(params.keyword);
      try {
        setLoading(true);
        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          const errorData = await response.json();
          setData(errorData.data);
          const messageError = errorData.message;
          showLoadingDataNotification(false);
          showErrorNotification({ message: messageError });
          setLoading(false);
          return;
        }
        const data = await response.json();
        setData(data);
        console.log(data);
        setShowProductList(data);
        setDataLength(data.length);
      } catch (error) {
      } finally {
        showLoadingDataNotification(false);
        setLoading(false);
      }
    };
    if (params.keyword) {
      fetchData();
    }
  }, []);

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
      {data.length === 0 && (
        <Container className={classes.root}>
          <div className={classes.label}>Nema pronađenih proizvoda</div>
          <Title className={classes.title}>Ups! Nismo pronašli ništa.</Title>
          <Text
            c="dimmed"
            size="lg"
            ta="center"
            className={classes.description}
          >
            Nažalost, nismo pronašli nijedan proizvod sa zadanom ključnom
            riječi. Možda pokušajte s drugom ključnom riječi.
          </Text>
          <Group justify="center">
            <Link to="/">
              <Button variant="subtle" size="md" to="/">
                Vrati me na početnu stranicu
              </Button>
            </Link>
          </Group>
        </Container>
      )}

      {data.length > 0 && (
        <CardTitleWithSort
          handleSortLowToHigh={handleSortLowToHigh}
          handleSortHighToLow={handleSortHighToLow}
          keyword={params.keyword}
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
