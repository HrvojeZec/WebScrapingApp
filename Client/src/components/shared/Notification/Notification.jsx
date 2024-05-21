import React from "react";
import { IconX, IconCheck } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { rem } from "@mantine/core";
export function successNotification({ message }) {
  notifications.show({
    title: "Success!",
    message: message,
    color: "teal",
    icon: <IconCheck size={18} />,
    autoClose: 4000,
    position: "top-right",
  });
}

export function errorNotification({ message }) {
  notifications.show({
    title: "Error!",
    message: message,
    color: "red",
    icon: <IconX size={18} />,
    autoClose: 3000,
    position: "top-right",
  });
}
let notificationId = null;

export function loadingDataNotification(value) {
  console.log(value);
  if (value) {
    notificationId = notifications.show({
      loading: true,
      title: "Učitavanje podataka",
      message:
        "Molimo pričekajte dok se podaci učitavaju, ne možete zatvoriti ovu obavijest",
      autoClose: false,
      withCloseButton: false,
    });
  } else if (notificationId) {
    notifications.update({
      id: notificationId,
      color: "teal",
      title: "Podaci su učitani",
      message:
        "Obavijest će se zatvoriti za 2 sekunde, sada možete zatvoriti ovu obavijest",
      icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
      loading: false,
      autoClose: 2000,
    });
    notificationId = null;
  }
}
