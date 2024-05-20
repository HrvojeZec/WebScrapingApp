import React from "react";
import { IconX, IconCheck } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

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

export function loadingDataNotification() {
  const id = notifications.show({
    loading: true,
    title: "Loading your data",
    message: "Data will be loaded in 3 seconds, you cannot close this yet",
    autoClose: false,
    withCloseButton: false,
  });

  setTimeout(() => {
    notifications.update({
      id,
      color: "teal",
      title: "Data was loaded",
      message:
        "Notification will close in 2 seconds, you can close this notification now",
      icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
      loading: false,
      autoClose: 2000,
    });
  }, 3000);
}
