import React, { useState } from "react";
import classes from "../../assets/stylesheets/contact.module.scss";
import { useForm } from "@mantine/form";
export function ContactPage() {
  const [error, setError] = useState();
  const [successMessage, setSuccessMessage] = useState();
  const form = useForm({
    initialValues: {
      storeName: "",
    },
  });

  const handleSubmit = async ({ storeName }) => {
    try {
      const response = await fetch("http://localhost:5000/api/storeData/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: storeName,
        }),
      });
      if (!response.ok) {
        const resError = await response.json();
        console.log(resError.message);
        setError(resError.message);
      } else {
        setError(null);
        const resSuccess = await response.json();
        console.log(resSuccess.message);
        setSuccessMessage(resSuccess.message);
      }
    } catch (error) {}
  };

  return (
    <div className={classes.contact}>
      <div className={classes.contact__wrapper}>
        <h1>Kontaktirajte nas</h1>
        <p>
          Unesite ime trgovine koju biste željeli pretraživati u budućnosti:
        </p>
        <form
          className={classes.contact__input}
          onSubmit={form.onSubmit((values) => handleSubmit(values))}
        >
          <input
            {...form.getInputProps("storeName")}
            placeholder="Unesite ime trgovine..."
          />
          <button type="submit">Pošalji</button>
        </form>
      </div>
    </div>
  );
}
