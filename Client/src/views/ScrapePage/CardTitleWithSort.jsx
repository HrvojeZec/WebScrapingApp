import React, { useState, forwardRef } from "react";
import { ArrowsSort } from "tabler-icons-react";
import classes from "../../assets/stylesheets/cardTitleWithSort.module.scss";
import { HoverCard, Group, Flex, UnstyledButton, Divider } from "@mantine/core";
const SortIcon = forwardRef((props, ref) => (
  <div ref={ref} {...props}>
    <ArrowsSort size={30} strokeWidth={1.5} color={"black"} />
  </div>
));
export function CardTitleWithSort({
  keyword,
  handleSortHighToLow,
  handleSortLowToHigh,
}) {
  return (
    <div className={classes.card__title}>
      <div className={classes.card__title__wrapper}>
        <h1>{keyword}</h1>
      </div>
      <Group>
        <HoverCard
          width={320}
          shadow="md"
          withArrow
          openDelay={200}
          closeDelay={4000}
        >
          <HoverCard.Target>
            <SortIcon />
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Flex align="center" direction="column">
              <p
                style={{
                  margin: 0,
                }}
              >
                Sort
              </p>
            </Flex>
            <Divider my="md" />
            <div className={classes.sort__button__wrapper}>
              <div>
                {" "}
                <UnstyledButton onClick={handleSortLowToHigh}>
                  Sort: low to high
                </UnstyledButton>
              </div>
              <Divider my="md" />
              <div>
                {" "}
                <UnstyledButton onClick={handleSortHighToLow}>
                  Sort: high to low
                </UnstyledButton>
              </div>
            </div>
          </HoverCard.Dropdown>
        </HoverCard>
      </Group>
    </div>
  );
}
