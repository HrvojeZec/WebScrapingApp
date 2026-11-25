import { useEffect, useState } from "react";
import { Image, SimpleGrid, Stack, Text } from "@mantine/core";
import classes from "./Search.module.scss";
import { useProductsData } from "@/entities/product/model/products-context";

interface Images {
  src: string;
  keyword: string;
}
function getRandomImages(images: Images[], count: number): Images[] {
  const shuffled = images.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function SliderComponent() {
  const { data: products } = useProductsData();
  const [randomImages, setRandomImages] = useState<Images[]>([]);

  useEffect(() => {
    if (products && products.length > 0) {
      const images = products.flatMap((product) =>
        (product.images ?? []).map((image) => ({
          src: image,
          keyword: product.title ?? "",
        })),
      );
      setRandomImages(getRandomImages(images, 4));
    }
  }, [products]);

  return (
    <div className={classes.imageContent}>
      <SimpleGrid cols={2} spacing="md">
        {randomImages.map((image, index) => (
          <Stack key={index} gap="xs" align="center">
            <Image src={image.src} alt={image.keyword} h={160} fit="contain" />
            <Text size="sm" fw={600} ta="center" lineClamp={2}>
              {image.keyword}
            </Text>
          </Stack>
        ))}
      </SimpleGrid>
    </div>
  );
}
