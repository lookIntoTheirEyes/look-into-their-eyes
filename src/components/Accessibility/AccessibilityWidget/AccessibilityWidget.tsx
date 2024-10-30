import Script from "next/script";

const UserWayWidget = () => {
  return (
    <Script
      src='https://cdn.userway.org/widget.js'
      data-account='d4waTY1WZa'
      strategy='afterInteractive'
    />
  );
};

export default UserWayWidget;
