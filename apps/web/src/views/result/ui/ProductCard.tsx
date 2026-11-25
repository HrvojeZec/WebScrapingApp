import { Image, Card, Text, Group, Button, Spoiler } from "@mantine/core";
import classes from "./ProductCard.module.scss";
import { Product } from "@/entities/product/model/types";

export function ProductCard({
  title,
  price,
  description,
  images,
  oldPrice,
  logo,
  link,
  updatedAt,
}: Product) {
  const formatData = updatedAt ? new Date(updatedAt).toLocaleDateString("hr-HR") : "";

  const imageArray = Array.isArray(images) ? images : [images];

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
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "82px",
              alignSelf: "end",
            }}
          >
            <img className={classes.storeLogo} src={logo} alt={`Logo ${title}`} />
          </div>
        )}
        <Card.Section style={{ padding: "0.5rem" }}>
          <Image className={classes.carousel} src={imageArray[0]} alt={title} />
        </Card.Section>

        <Group justify="space-between" mt="lg">
          <Text fw={500} fz="lg">
            {title}
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

          <Button onClick={() => link && (window.location.href = link)} radius="md">
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
