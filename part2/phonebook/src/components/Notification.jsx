import React from "react";

const Notification = ({ message, color }) => {
  if (message === null) {
    return null;
  }

  return <div className={color ? "confirm" : "error"}>{message}</div>;
};

export default Notification;
