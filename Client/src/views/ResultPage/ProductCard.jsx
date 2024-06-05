import React from "react";
import { Image, Card, Text, Group, Button, Spoiler } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import classes from "../../assets/stylesheets/CarouselCard.module.css";
import dayjs from "dayjs";
export function ProductCard({
  name,
  price,
  description,
  images,
  oldPrice,
  logo,
  link,
  updatedAt,
}) {
  dayjs().format();
  dayjs(`${updatedAt}`).format("[YYYYescape] YYYY-MM-DDTHH:mm:ssZ[Z]");
  const formatData = dayjs(`${updatedAt}`).format("DD/MM/YYYY");

  const imageArray = Array.isArray(images) ? images : [images];
  const slides = imageArray.map((image) => (
    <Carousel.Slide key={image}>
      <Image src={image} />
    </Carousel.Slide>
  ));

  return (
    <>
      {" "}
      <Card className={classes.card} radius="md" withBorder padding="xl">
        {logo.startsWith("<svg") ? (
          <div
            dangerouslySetInnerHTML={{ __html: logo }}
            style={{ display: "flex", justifyContent: "flex-end" }}
          />
        ) : (
          <img className={classes.storeLogo} src={logo} alt={`Logo ${name}`} />
        )}
        <Card.Section style={{ padding: "0.5rem" }}>
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

          <Button
            onClick={(event) => (window.location.href = link)}
            radius="md"
          >
            Kupi
          </Button>
        </Group>
        <div className={classes.updatedAtContainer}>
          <Text span fw={500} className={classes.timeSet}>
            Ažurirano u: {formatData}
          </Text>
        </div>
      </Card>
    </>
  );
}
