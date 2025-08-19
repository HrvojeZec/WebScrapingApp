import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CardTitleWithSort } from './CardTitleWithSort';
import { ProductCard } from './ProductCard';
import { LoaderGlobal } from '../../components/shared/Loader/Loader';
import { constants } from '../../config/constants';
import { Avatar, Flex, Pagination, Select } from '@mantine/core';
import classes from '../../components/Scrape/Scrape.module.scss';
import {
  showErrorNotification,
  showLoadingDataNotification,
} from '../../components/shared/Notification/Notification';
import { Title, Text, Button, Container, Group } from '@mantine/core';
import { Link } from 'react-router-dom';
import { Product } from '../../types/ProductTypes';

interface DataType {
  products: Product[];
  totalPages: number;
  currentPage: number;
}

function useCurrentURL() {
  const location = useLocation();
  const params = useParams();
  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get('page') || '1', 10);

  return {
    pathname: location.pathname,
    search: location.search,
    params,
    page,
  };
}

interface StoreSelectItemProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
  logo: string;
}
const StoreSelectItem = ({ label, logo, ...others }: StoreSelectItemProps) => {
  const isSvg = logo && logo.startsWith('<svg');

  return (
    <Group wrap="nowrap" spacing="xs" {...others}>
      {isSvg ? (
        <div
          style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          dangerouslySetInnerHTML={{ __html: logo || '' }}
        />
      ) : logo ? (
        <img
          src={logo}
          alt={`Logo ${label}`}
          style={{
            width: 24,
            height: 24,
            objectFit: 'contain',
            borderRadius: 4,
          }}
        />
      ) : null}

      <Text>{label}</Text>
    </Group>
  );
};
const allStores = [
  {
    storeId: '664a46c9e9d88f832eb4e589',
    storeName: 'Mall',
    logo: `<svg viewBox="0 0 162 75" fill="none" xmlns="http://www.w3.org/2000/svg">...</svg>`,
  },
  {
    storeId: '664a46c9e9d88f832eb4e58a',
    storeName: 'Sancta Domenica',
    logo: 'https://cdn.sancta-domenica.hr/static/version1713185553/frontend/Sanct...',
  },
];

function ScrapeResult() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataType>({
    products: [],
    totalPages: 1,
    currentPage: 1,
  });
  const [showProductList, setShowProductList] = useState<Product[]>([]);
  const [productsPerPage] = useState(15);
  const [storeFilters, setStoreFilters] = useState(allStores);

  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const { pathname, search, params, page, scrapeId, keyword } = useCurrentURL();
  const navigate = useNavigate();

  const handlePageChange = (newPage: number) => {
    navigate(`${pathname}?keyword=${params.keyword}&page=${newPage}`);
  };

  const getUrl = () => {
    const searchParams = new URLSearchParams(search);
    const storeIdToUse = searchParams.get('storeId') || selectedStore;

    if (storeIdToUse) {
      return `${constants.apiUrl}/api/products/keyword?keyword=${params.keyword}&page=${page}&pageSize=${productsPerPage}&storeId=${storeIdToUse}`;
    } else if (params.scrapeId) {
      // Ako postoji scrapeId, koristi scraping API
      return `${constants.apiUrl}/api/products/scrape?scrapeId=${params.scrapeId}&keyword=${params.keyword}&page=${page}&pageSize=${productsPerPage}`;
    } else if (params.keyword) {
      // Ako postoji samo keyword, koristi search API
      return `${constants.apiUrl}/api/products/keyword?keyword=${params.keyword}&page=${page}&pageSize=${productsPerPage}`;
    }
    return '';
  };
  const fetchData = async (url: string) => {
    try {
      setLoading(true);
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setData({ products: [], totalPages: 1, currentPage: 1 });
        showLoadingDataNotification(false);
        showErrorNotification({ message: errorData.message });
        setLoading(false);
        return;
      }

      const data: DataType = await response.json();
      setData(data);
      setShowProductList(data.products);
    } catch (error) {
      setData({ products: [], totalPages: 1, currentPage: 1 });
      showErrorNotification({ message: 'Došlo je do greške.' });
    } finally {
      showLoadingDataNotification(false);
      setLoading(false);
    }
  };

  // useEffect koji poziva fetchData kada se keyword ili scrapeId promijene
  useEffect(() => {
    const url = getUrl();
    if (url) {
      fetchData(url);
    }
  }, [params.keyword, params.scrapeId, page, productsPerPage, selectedStore]);

  const handleSortLowToHigh = () => {
    const sortedProducts = [...showProductList].sort(
      (a, b) =>
        parseFloat(a.price.replace(' €', '').replace('.', '')) -
        parseFloat(b.price.replace(' €', '').replace('.', '')),
    );

    setShowProductList(sortedProducts);
  };

  const handleSortHighToLow = () => {
    const reverseSortedProducts = [...showProductList].sort(
      (a, b) =>
        parseFloat(b.price.replace(' €', '').replace('.', '')) -
        parseFloat(a.price.replace(' €', '').replace('.', '')),
    );

    setShowProductList(reverseSortedProducts);
  };

  useEffect(() => {
    const storesMap = new Map<string, { storeName: string; logo: string }>();

    // Prvo ubaci sve iz allStores
    allStores.forEach(({ storeId, storeName, logo }) => {
      storesMap.set(storeId, { storeName, logo });
    });

    // Pa dopuni trgovine iz proizvoda koje možda nisu u allStores
    data.products.forEach((product) => {
      if (!storesMap.has(product.storeId)) {
        storesMap.set(product.storeId, {
          storeName: product.storeName,
          logo: product.logo,
        });
      }
    });

    const storesArray = Array.from(
      storesMap,
      ([storeId, { storeName, logo }]) => ({
        storeId,
        storeName,
        logo,
      }),
    );

    setStoreFilters(storesArray);
  }, [data.products]);

  /*  useEffect(() => {
    if (selectedStore) {
      const filtered = data.products.filter(
        (product) => product.storeId === selectedStore,
      );
      setShowProductList(filtered);
    } else {
      setShowProductList(data.products);
    }
  }, [selectedStore, data.products]); */
  useEffect(() => {
    setShowProductList(data.products);
  }, [data.products]);

  console.log(data.products);
  const handleStoreChange = (storeId: string | null) => {
    setSelectedStore(storeId);

    const newSearchParams = new URLSearchParams(search);
    newSearchParams.set('page', '1'); // reset paginacije

    if (storeId) {
      newSearchParams.set('storeId', storeId);
    } else {
      newSearchParams.delete('storeId');
    }

    navigate(`${pathname}?${newSearchParams.toString()}`);
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
              <Button variant="subtle" size="md">
                Vrati me na početnu stranicu
              </Button>
            </Link>
          </Group>
        </Container>
      )}

      {data.products.length > 0 && (
        <>
          <Flex>
            <CardTitleWithSort
              handleSortLowToHigh={handleSortLowToHigh}
              handleSortHighToLow={handleSortHighToLow}
              keyword={params.keyword}
              extraComponent={
                <Select
                  label="Filtriraj po trgovini"
                  placeholder="Odaberi trgovinu"
                  value={selectedStore}
                  onChange={handleStoreChange}
                  itemComponent={StoreSelectItem}
                  data={[
                    { value: '', label: 'Sve trgovine', logo: '' },
                    ...storeFilters.map(({ storeId, storeName, logo }) => ({
                      value: storeId,
                      label: storeName,
                      logo,
                    })),
                  ]}
                  clearable
                  style={{ width: 200 }}
                />
              }
            />
          </Flex>
          <div className={classes.cardWrapper}>
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
          <div className={classes.paginationWrapper}>
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
