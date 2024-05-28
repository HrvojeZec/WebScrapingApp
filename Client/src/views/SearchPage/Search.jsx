import React, { useState } from "react";
import classes from "../../assets/stylesheets/search.module.scss";
import { ContactPage } from "../ContactPage/ContactPage";
import {
  showErrorNotification,
  showLoadingDataNotification,
} from "../../components/shared/Notification/Notification";
import { SliderComponent } from "./Slider";
import { SmartShopText } from "../../components/shared/BrandLogo/SmartShop";
import { useNavigate } from "react-router-dom";
import { constants } from "../../config/constants";

function Search() {
  const [keyword, setKeyword] = useState("");
  //TO DO: DODATI OVDJE KEYWORD PROVIDER ZA SET DATA,ERROR,LOADER
  const navigate = useNavigate();

  const handleScrape = async (event) => {
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
        const messageError = errorData.message;
        showErrorNotification({ message: messageError });
      } else {
        navigate(`/resultPage?keyword=${keyword}`);
        //navigate("/resultPage");
        //  navigate(`/resultPage?data=${JSON.stringify(successData.data)}`);
      }
    } catch (error) {
      navigate(`/resultPage?keyword=${keyword}&operation=scrape`);
    } finally {
      showLoadingDataNotification(false);
    }
  };

  const handleLoadFromDatabase = async (event) => {
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
        showErrorNotification({ message: messageError });
      } else {
        navigate(`/resultPage?keyword=${keyword}&operation=load`);
        //navigate("/resultPage");
        //  navigate(`/resultPage?data=${JSON.stringify(successData.data)}`);
      }
    } catch (error) {
      showErrorNotification({
        message: "An error occurred while loading data from the database.",
      });
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
      <ContactPage />
    </>
  );
}

export default Search;
