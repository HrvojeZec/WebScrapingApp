import React from "react";
import classes from "../../components/Contact/Contact.module.scss";
import { useForm } from "@mantine/form";
import { showSuccessNotification } from "../../components/shared/Notification/Notification";
import { constants } from "../../config/constants";
import { ActionIcon, TextInput, useMantineTheme, rem } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";

export function ContactPage() {
  const theme = useMantineTheme();

  const form = useForm({
    initialValues: {
      storeName: "",
    },
  });

  const handleSubmit = async ({ storeName }) => {
    if (storeName.length < 2 || storeName.length > 10) {
      form.setFieldError("storeName", "Ime trgovine mora biti 2-10 znakova.");
      return;
    } else if (/[^A-Za-z0-9\s]/.test(storeName)) {
      form.setFieldError("storeName", "Koristite samo alfanumeričke znakove.");
      return;
    }
    try {
      const response = await fetch(`${constants.apiUrl}/api/storeData/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: storeName,
        }),
      });

      if (!response.ok) {
        const resError = await response.json();
        const messageError = resError.message;
        form.setFieldError("storeName", messageError);
        return;
      }
      const resSuccess = await response.json();
      const messageSuccess = resSuccess.message;
      showSuccessNotification({ message: messageSuccess });
    } catch (error) {
      form.setFieldError("storeName", error.message);
    }
  };

  const handleActionIconSubmit = () => {
    handleSubmit(form.values);
  };

  return (
    <div className={classes.contact} data-aos="fade-up">
      <div className={classes.contact__wrapper}>
        <h1>Kontaktirajte nas</h1>
        <p>
          Unesite ime trgovine koju biste željeli pretraživati u budućnosti:
        </p>

        <form
          className={classes.contact__input}
          onSubmit={form.onSubmit((values) => handleSubmit(values))}
        >
          <TextInput
            {...form.getInputProps("storeName")}
            placeholder="Unesite ime trgovine..."
            error={form.errors.storeName}
            size="lg"
            radius="lg"
            rightSection={
              <ActionIcon
                size={32}
                radius="xl"
                color={theme.primaryColor}
                variant="filled"
                onClick={handleActionIconSubmit}
              >
                <IconArrowRight
                  style={{ width: rem(18), height: rem(18) }}
                  stroke={1.5}
                />
              </ActionIcon>
            }
          />
        </form>
      </div>
    </div>
  );
}
