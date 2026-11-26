import type { ReactNode } from "react";
import { Button, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FILTER_TEXT } from "../../model/constants";
import classes from "./FilterDrawer.module.scss";

type Props = {
  activeCount: number;
  /** The filter panel; the drawer only frames it */
  children: ReactNode;
};

/** On phones and tablets: "Filteri (n)" opens the panel from the bottom of the screen. */
export function FilterDrawer({ activeCount, children }: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const label = activeCount > 0 ? `${FILTER_TEXT.title} (${activeCount})` : FILTER_TEXT.title;

  return (
    <>
      <Button variant="outline" onClick={open} aria-haspopup="dialog">
        {label}
      </Button>
      <Drawer
        opened={opened}
        onClose={close}
        position="bottom"
        size="auto"
        title={FILTER_TEXT.title}
        classNames={{ content: classes.content, body: classes.body }}
      >
        {children}
        <Button fullWidth onClick={close} className={classes.done}>
          {FILTER_TEXT.showResults}
        </Button>
      </Drawer>
    </>
  );
}
