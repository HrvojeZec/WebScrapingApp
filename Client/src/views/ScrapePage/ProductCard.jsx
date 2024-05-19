import React from "react";
import { Image, Card, Text, Group, Button, Spoiler } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import classes from "../../assets/stylesheets/CarouselCard.module.css";

export function ProductCard({
  productId,
  name,
  price,
  description,
  images,
  oldPrice,
  logo,
  link,
}) {
  const slides = images.map((image) => (
    <Carousel.Slide key={image}>
      <Image src={image} />
    </Carousel.Slide>
  ));

  return (
    <Card className={classes.card} radius="md" withBorder padding="xl">
      <Card.Section>
        <Carousel
          withIndicators
          loop
          classNames={{
            root: classes.carousel,
            controls: classes.carouselControls,
            indicator: classes.carouselIndicator,
          }}
        >
          {slides}
        </Carousel>
      </Card.Section>

      <Group justify="space-between" mt="lg">
        <Text fw={500} fz="lg">
          {name}
        </Text>
      </Group>

      <Spoiler maxHeight={120} showLabel="Show more" hideLabel="Hide">
        {description}
      </Spoiler>

      <Group justify="space-between" mt="md">
        <div>
          <Text fz="xl" span fw={500} className={classes.price}>
            {price}
          </Text>
          <Text span fz="sm" c="dimmed">
            {" "}
            / {oldPrice}
          </Text>
        </div>

        <Button radius="md">Buy</Button>
      </Group>
    </Card>
  );
}
