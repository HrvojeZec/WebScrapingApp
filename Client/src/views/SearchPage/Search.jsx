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
  const navigate = useNavigate();

  useEffect(() => {
    let errorMessage = "";
    if (keyword.length > 20) {
      errorMessage = "Previše slova, smanjite do 20.";
    } else if (/,/.test(keyword)) {
      errorMessage = "Napišite samo jedan proizvod bez nabrajanja.";
    } else if (/[^A-Za-z0-9\s]/.test(keyword)) {
      errorMessage = "Koristite samo alfanumeričke znakove.";
    }
    setError(errorMessage);
    setDisabledButton(keyword.length < 1 || errorMessage !== "");
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

        console.log(successData);

        navigate("rezultati/" + encodeURIComponent(keyword));
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
    navigate("/rezultati/" + encodeURIComponent(keyword));
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
              <form action=""></form>
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
