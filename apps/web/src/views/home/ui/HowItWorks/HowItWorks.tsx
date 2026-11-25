import { Container, Text, Title } from "@mantine/core";
import { HOME_TEXT, HOW_IT_WORKS_STEPS } from "../../model/constants";
import classes from "./HowItWorks.module.scss";

/** Three numbered steps; the numbers are earned, since this really is the order. */
export function HowItWorks() {
  return (
    <section className={classes.section} aria-labelledby="how-heading">
      <Container>
        <Title order={2} id="how-heading" className={classes.heading}>
          {HOME_TEXT.howItWorks}
        </Title>
        <ol className={classes.steps}>
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <li key={step.title} className={classes.step}>
              <span className={classes.number} aria-hidden>
                {index + 1}
              </span>
              <Title order={3} className={classes.title}>
                {step.title}
              </Title>
              <Text className={classes.text}>{step.text}</Text>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
