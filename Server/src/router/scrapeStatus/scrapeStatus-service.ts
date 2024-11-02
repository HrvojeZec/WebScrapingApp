let scrapingInProgress = false;

const setScrapingStatus = (status: boolean) => {
  scrapingInProgress = status;
};

const getScrapingStatus = () => {
  return scrapingInProgress;
};
module.exports = { getScrapingStatus, setScrapingStatus };
