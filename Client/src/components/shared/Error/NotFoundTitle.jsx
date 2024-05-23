import { Title, Text, Button, Container, Group } from "@mantine/core";
import classes from "./NotFoundTitle.module.css";

export function NotFoundTitle() {
  return (
    <Container className={classes.root}>
      <div className={classes.label}>404</div>
      <Title className={classes.title}>Pronašli ste tajno mjesto.</Title>
      <Text c="dimmed" size="lg" ta="center" className={classes.description}>
        Nažalost, ovo je samo 404 stranica. Možda ste pogrešno upisali adresu
        ili je stranica premještena na drugu URL adresu.
      </Text>
      <Group justify="center">
        <Button variant="subtle" size="md">
          Vrati me na početnu stranicu
        </Button>
      </Group>
    </Container>
  );
}
