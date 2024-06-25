import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CardTitleWithSort } from "./CardTitleWithSort";
import { ProductCard } from "./ProductCard";
import { LoaderGlobal } from "../../components/shared/Loader/Loader";
import { constants } from "../../config/constants";
import { Pagination } from "@mantine/core";
import classes from "../../components/Scrape/Scrape.module.scss";
import {
  showErrorNotification,
  showLoadingDataNotification,
} from "../../components/shared/Notification/Notification";
import { Title, Text, Button, Container, Group } from "@mantine/core";
import { Link } from "react-router-dom";
import { Product } from "../../lib/ProductTypes";

interface DataType {
  products: Product[],
  totalPages: number,
  currentPage: number,
}

function useCurrentURL() {
  const location = useLocation();
  const params = useParams();
  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get("page") || "1", 10);

  return {
    pathname: location.pathname,
    search: location.search,
    params,
    page,
  };
}

function ScrapeResult() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataType>({
    products: [],
    totalPages: 1,
    currentPage: 1,
  })
  const [showProductList, setShowProductList] = useState<Product[]>([]);
  const [productsPerPage] = useState(15);
  const { pathname, search, params, page } = useCurrentURL();
  const navigate = useNavigate();
  console.log(
    `Current path is ${pathname} with search ${search} and params ${params} on ${page}`
  );

  const handlePageChange = (newPage: number) => {
    navigate(`${pathname}?keyword=${params.keyword}&page=${newPage}`);
  };

  let url = `${constants.apiUrl}/api/products/keyword?keyword=${params.keyword}&page=${page}&pageSize=${productsPerPage}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.log(errorData);
          setData({ products: [], totalPages: 1, currentPage: 1 });
          const messageError = errorData.message;
          showLoadingDataNotification(false);
          showErrorNotification({ message: messageError });
          setLoading(false);
          return;
        }
        const data: DataType = await response.json();
        setData(data);
        console.log(data);
        setShowProductList(data.products);
      } catch (error) {
        setData({ products: [], totalPages: 1, currentPage: 1 });
        showErrorNotification({ message: "Došlo je do greške." });
      } finally {
        showLoadingDataNotification(false);
        setLoading(false);
      }
    };

    if (params.keyword) {
      fetchData();
    }
  }, [params.keyword, productsPerPage, page]);

  const handleSortLowToHigh = () => {
    const sortedProducts = [...data.products].sort(
      (a, b) =>
        parseFloat(a.price.replace(" €", "").replace(".", "")) -
        parseFloat(b.price.replace(" €", "").replace(".", ""))
    );

    setShowProductList(sortedProducts);
  };

  const handleSortHighToLow = () => {
    const reverseSortedProducts = [...data.products].sort(
      (a, b) =>
        parseFloat(b.price.replace(" €", "").replace(".", "")) -
        parseFloat(a.price.replace(" €", "").replace(".", ""))
    );

    setShowProductList(reverseSortedProducts);
  };

  return (
    <div className={classes.scrapeResult}>
      {loading && <LoaderGlobal />}
      {data.products.length === 0 && !loading && (
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
              <Button variant="subtle" size="md" >
                Vrati me na početnu stranicu
              </Button>
            </Link>
          </Group>
        </Container>
      )}

      {data.products.length > 0 && (
        <>
          <CardTitleWithSort
            handleSortLowToHigh={handleSortLowToHigh}
            handleSortHighToLow={handleSortHighToLow}
            keyword={params.keyword}
          />
          <div className={classes.card__wrapper}>
            {showProductList.map((product, index) => (
              <ProductCard
                key={index}
                productId={product.productId} 
                title={product.title}
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
            <Pagination
              total={data.totalPages}
              value={page}
              onChange={handlePageChange}
              mt="sm"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ScrapeResult;
