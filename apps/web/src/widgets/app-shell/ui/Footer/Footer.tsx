import { Anchor, Container, Text, Title } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";
import { APP_NAME } from "@/shared/constants/ui";
import { FOOTER_TEXT, REPO_URL } from "../../model/constants";
import classes from "./Footer.module.scss";

export function Footer() {
  return (
    <footer className={classes.footer}>
      <Container className={classes.inner}>
        <section className={classes.column}>
          <Title order={2} className={classes.heading}>
            {APP_NAME}
          </Title>
          <Text className={classes.text}>{FOOTER_TEXT.about}</Text>
          <Anchor
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={classes.repoLink}
          >
            <IconBrandGithub aria-hidden className={classes.repoIcon} />
            {FOOTER_TEXT.sourceCode}
          </Anchor>
        </section>
        <section className={classes.column}>
          <Title order={2} className={classes.heading}>
            {FOOTER_TEXT.dataHeading}
          </Title>
          <Text className={classes.text}>{FOOTER_TEXT.data}</Text>
          <Text className={classes.text}>{FOOTER_TEXT.notAffiliated}</Text>
        </section>
      </Container>
    </footer>
  );
}
