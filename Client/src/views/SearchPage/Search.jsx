import React, { useEffect, useState } from "react";
import classes from "../../assets/stylesheets/search.module.scss";
import { ContactPage } from "../ContactPage/ContactPage";
import { showLoadingDataNotification } from "../../components/shared/Notification/Notification";
import { SliderComponent } from "./Slider";
import { SmartShopText } from "../../components/shared/BrandLogo/SmartShop";
import { useNavigate } from "react-router-dom";
import { constants } from "../../config/constants";
import { Autocomplete, Button, Tooltip } from "@mantine/core";
import { useKeywordsData } from "../../stores/GetAllKeywords";

function Search() {
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState();
  const [disabledButton, setDisabledButton] = useState(true);
  const { data: keywordsData } = useKeywordsData();
  //TO DO: DODATI OVDJE KEYWORD PROVIDER ZA SET DATA,ERROR,LOADER
  const navigate = useNavigate();

  useEffect(() => {
    setDisabledButton(keyword.length < 1);
  }, [keyword]);
  const handleScrape = async () => {
    try {
      showLoadingDataNotification(true);
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
        setError(messageError);
      } else {
        const successData = await response.json();
        console.log(successData.products[0].scrapeId);
        const scrapeId = successData.products[0].scrapeId;
        navigate(`/resultPage?scrapeId=${scrapeId}&operation=scrape`);
      }
    } catch (error) {
      const message =
        "Došlo je do pogreške prilikom učitavanja podataka iz baze podataka.";
      setError(message);
    } finally {
      showLoadingDataNotification(false);
    }
  };

  const handleLoadFromDatabase = async () => {
    try {
      showLoadingDataNotification(true);
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
        setError(messageError);
      } else {
        navigate(`/resultPage?keyword=${keyword}&operation=load`);
      }
    } catch (error) {
      const message =
        "Došlo je do pogreške prilikom učitavanja podataka iz baze podataka.";
      setError(message);
    } finally {
      showLoadingDataNotification(false);
    }
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
              <Autocomplete
                type="text"
                placeholder="Unesite proizvod koji tražite..."
                value={keyword}
                error={error}
                size="lg"
                radius="lg"
                data={keywordsData}
                withScrollArea={false}
                styles={{ dropdown: { maxHeight: 200, overflowY: "auto" } }}
                onChange={(newKeyword) => setKeyword(newKeyword)}
              />
              <div className={classes.button__wrapper}>
                <Tooltip label="Unesite traženi proizvod">
                  <Button
                    type="button"
                    disabled={disabledButton}
                    size="md"
                    onClick={handleScrape}
                    variant="gradient"
                    gradient={{
                      from: "#ff7f50",
                      to: "rgba(184, 0, 0, 1)",
                      deg: 107,
                    }}
                  >
                    Pokreni scrapanje
                  </Button>
                </Tooltip>
                <Tooltip label="Unesite traženi proizvod">
                  <Button
                    type="button"
                    disabled={disabledButton}
                    size="md"
                    onClick={handleLoadFromDatabase}
                    variant="gradient"
                    gradient={{ from: "cyan", to: "blue", deg: 225 }}
                  >
                    Učitaj proizvode
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
          <SliderComponent />
        </div>
      </div>
      <ContactPage />
    </>
  );
}

export default Search;
