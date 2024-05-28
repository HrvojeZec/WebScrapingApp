import React from "react";
import classes from "../../assets/stylesheets/contact.module.scss";
import { useForm } from "@mantine/form";
import {
  showSuccessNotification,
  showErrorNotification,
} from "../../components/shared/Notification/Notification";
import { constants } from "../../config/constants";
import { TextInput } from "@mantine/core";

export function ContactPage() {
  const form = useForm({
    initialValues: {
      storeName: "",
    },
    validate: {
      storeName: (value) =>
        value.length < 2 ? "Ime trgovine je obavezno!" : null,
    },
  });

  const handleSubmit = async ({ storeName }) => {
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
        console.log(messageError);
        showErrorNotification({ message: messageError });
        return;
      }

      const resSuccess = await response.json();
      const messageSuccess = resSuccess.message;
      console.log(messageSuccess);
      showSuccessNotification({ message: messageSuccess });
    } catch (error) {
      console.error(error); // Log the actual error
      showErrorNotification({ message: error.message }); // Display the error message
    }
  };

  return (
    <div className={classes.contact} /* data-aos="fade-up" */>
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
          />
          <button type="submit">Pošalji</button>
        </form>
      </div>
    </div>
  );
}
