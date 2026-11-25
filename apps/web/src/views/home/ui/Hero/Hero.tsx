import { Container, Text } from "@mantine/core";
import { SearchBox } from "@/features/search-products/ui/SearchBox/SearchBox";
import { AnimatedHeading } from "@/shared/ui/motion/AnimatedHeading/AnimatedHeading";
import { HOME_TEXT } from "../../model/constants";
import { PopularCategories } from "../PopularCategories/PopularCategories";
import classes from "./Hero.module.scss";

export function Hero() {
  return (
    <section className={classes.hero}>
      <Container className={classes.inner}>
        <AnimatedHeading text={HOME_TEXT.heading} className={classes.heading} />
        <Text className={classes.lead}>{HOME_TEXT.lead}</Text>
        <div className={classes.search}>
          <SearchBox size="hero" />
        </div>
        <PopularCategories />
      </Container>
    </section>
  );
}
