import React, { useState, forwardRef } from "react";
import classes from "../../assets/stylesheets/scrape.module.scss";
import { useProductsData } from "../../stores/GetAllProducts";
import Slider from "react-slick";
import { LoaderGlobal } from "../../components/shared/Loader/Loader";
import { ProductCard } from "./ProductCard";
import {
  Pagination,
  HoverCard,
  Text,
  Group,
  UnstyledButton,
  Divider,
  Flex,
} from "@mantine/core";
import { ContactPage } from "../ContactPage/ContactPage";
import { errorNotification } from "../../components/shared/Notification/Notification";
import { loadingDataNotification } from "../../components/shared/Notification/Notification";
import { ArrowsSort } from "tabler-icons-react";

const SortIcon = forwardRef((props, ref) => (
  <div ref={ref} {...props}>
    <ArrowsSort size={30} strokeWidth={1.5} color={"black"} />
  </div>
));

function Scrape() {
  const [keyword, setKeyword] = useState("");
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [dataLength, setDataLength] = useState();
  const [activePage, setActivePage] = useState(1);
  const [showProductList, setShowProductList] = useState();
  const [productsPerPage] = useState(15);
  const { data: Products } = useProductsData();
  const images = Products.map((product) => {
    return product.images;
  });
  const mergeImages = images.reduce((acc, curr) => acc.concat(curr), []);
  const totalPages = Math.ceil(dataLength / productsPerPage);
  const handlePageChange = (newPage) => {
    setActivePage(newPage);
  };

  const handleScrape = async (event) => {
    console.log(keyword);
    event.preventDefault();
    if (keyword.length > 3) {
      loadingDataNotification(true);
    }
    try {
      const response = await fetch("http://localhost:5000/api/scrape", {
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
        loadingDataNotification(false);
        errorNotification({ message: messageError });
      }

      const successData = await response.json();
      console.log(successData);
      const data = successData.data;
      console.log(data);
      setData(data);
      setShowProductList(data);
    } catch (error) {
    } finally {
      loadingDataNotification(false);
    }
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
      console.log(res);
      setDataLength(res.data.length);
      setData(res.data);
      setShowProductList(res.data);
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
  const HandleSortLowToHigh = () => {
    console.log("low to high");
    const sortedProducts = [...data].sort(
      (a, b) =>
        parseFloat(a.price.replace(" €", "").replace(".", "")) -
        parseFloat(b.price.replace(" €", "").replace(".", ""))
    );
    console.log("sorted: ", sortedProducts);
    setShowProductList(sortedProducts);
  };

  const HandleSortHighToLow = () => {
    console.log("high to low");
    const reverseSortedProducts = [...data].sort(
      (a, b) =>
        parseFloat(b.price.replace(" €", "").replace(".", "")) -
        parseFloat(a.price.replace(" €", "").replace(".", ""))
    );
    console.log("sorted: ", reverseSortedProducts);
    setShowProductList(reverseSortedProducts);
  };
  console.log(showProductList);
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

      {data && (
        <div className={classes.card__title}>
          <div className={classes.card__title__wrapper}>
            <h1>{keyword}</h1>
          </div>
          <Group>
            <HoverCard
              width={320}
              shadow="md"
              withArrow
              openDelay={200}
              closeDelay={4000}
            >
              <HoverCard.Target>
                <SortIcon />
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Flex align="center" direction="column">
                  <p
                    style={{
                      margin: 0,
                    }}
                  >
                    Sort
                  </p>
                </Flex>
                <Divider my="md" />
                <div className={classes.sort__button__wrapper}>
                  <div>
                    {" "}
                    <UnstyledButton onClick={HandleSortLowToHigh}>
                      Sort: low to high
                    </UnstyledButton>
                  </div>
                  <Divider my="md" />
                  <div>
                    {" "}
                    <UnstyledButton onClick={HandleSortHighToLow}>
                      Sort: high to low
                    </UnstyledButton>
                  </div>
                </div>
              </HoverCard.Dropdown>
            </HoverCard>
          </Group>
        </div>
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
