import { useEffect, useState } from 'react';
import classes from '../../components/Search/Search.module.scss';
import { ContactPage } from '../ContactPage/ContactPage';
import { showLoadingDataNotification } from '../../components/shared/Notification/Notification';
import { SliderComponent } from './Slider';
import { SmartShopText } from '../../components/shared/BrandLogo/SmartShop';
import { useNavigate } from 'react-router-dom';
import { constants } from '../../config/constants';
import { Autocomplete, Button, Tooltip } from '@mantine/core';
import { useKeywordsData } from '../../stores/GetAllKeywords';

function Search() {
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState<string>();
  const [disabledButton, setDisabledButton] = useState(true);
  const [scrapeId, setScrapeId] = useState(null);
  const { data: keywordsData } = useKeywordsData();
  const navigate = useNavigate();
  console.log('scrapeId: ', scrapeId);
  useEffect(() => {
    if (scrapeId) {
      monitoringScrapeStatus();
    }
  }, [scrapeId]);
  useEffect(() => {
    let errorMessage = '';
    if (keyword.length > 20) {
      errorMessage = 'Previše slova, smanjite do 20.';
    } else if (/,/.test(keyword)) {
      errorMessage = 'Napišite samo jedan proizvod bez nabrajanja.';
    } else if (/[^A-Za-z0-9\s]/.test(keyword)) {
      errorMessage = 'Koristite samo alfanumeričke znakove.';
    }
    setError(errorMessage);
    setDisabledButton(keyword.length < 1 || errorMessage !== '');
  }, [keyword]);

  const checkScrapeStatus = async () => {
    if (!scrapeId) return 'not_started';
    console.log('u checkScrapeStatus scrapeId: ', scrapeId);
    console.log('usli smo u checkScrapeStatus');

    const response = await fetch(`${constants.apiUrl}/api/status/${scrapeId}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response.json();
      const messageError = errorData.message;
      setError(messageError);
    }
    const data = await response.json();
    const messageError = data.message;
    const status = data.status;
    console.log('data u checkScrapeStatus: ', data);
    console.log('status koji je poslan od checkScrapeStatus: ', status);
    console.log('message koji je poslan od checkScrapeStatus: ', messageError);

    setError(messageError);
    return status;
  };
  const monitoringScrapeStatus = async () => {
    const intervalId = setInterval(async () => {
      const status = await checkScrapeStatus();
      console.log('u monitoringScrapingStatus status: ', status);

      if (status === 'finished') {
        clearInterval(intervalId);
        showLoadingDataNotification(false);
        if (scrapeId != null) {
          navigate('/rezultati/' + encodeURIComponent(keyword));
        }
      }
    }, 5000);
  };

  const handleScrape = async () => {
    if (scrapeId != null) {
      const currentStatus = await checkScrapeStatus();
      console.log('currentStatus: ', currentStatus);

      if (currentStatus === 'started') {
        setError('Scrapanje je već u tijeku za odabranu ključnu riječ.');
        return;
      }
    }
    try {
      showLoadingDataNotification(true);
      const response = await fetch(`${constants.apiUrl}/api/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

        console.log('scrapId: ', successData);
        setScrapeId(successData);

        monitoringScrapeStatus();

        /*         navigate('rezultati/' + encodeURIComponent(keyword)); */
      }
    } catch (error) {
      const message =
        'Došlo je do pogreške prilikom učitavanja podataka iz baze podataka.';
      setError(message);
    }
  };

  const handleLoadFromDatabase = async () => {
    navigate('/rezultati/' + encodeURIComponent(keyword));
  };

  return (
    <>
      <div className={classes.scrape}>
        <div className={classes.scrapeWrapper}>
          <div className={classes.scrapeContent} data-aos="fade-right">
            <div className={classes.contentUpper}>
              <SmartShopText />
              <p>
                Moćna platforma za analizu proizvoda i rasta koja vam pomaže u
                pretraživanju više trgovina, uključujući Mall i Sancta Domenica.
              </p>
            </div>
            <div className={classes.contentInput}>
              <form action=""></form>
              <Autocomplete
                type="text"
                placeholder="Unesite proizvod koji tražite..."
                value={keyword}
                error={error}
                size="lg"
                radius="lg"
                data={keywordsData || []}
                withScrollArea={false}
                styles={{ dropdown: { maxHeight: 200, overflowY: 'auto' } }}
                onChange={(newKeyword) => setKeyword(newKeyword)}
              />
              <div className={classes.buttonWrapper}>
                <Tooltip label="Unesite traženi proizvod">
                  <Button
                    type="button"
                    disabled={disabledButton}
                    size="md"
                    onClick={handleScrape}
                    variant="gradient"
                    gradient={{
                      from: '#ff7f50',
                      to: 'rgba(184, 0, 0, 1)',
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
                    gradient={{ from: 'cyan', to: 'blue', deg: 225 }}
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
