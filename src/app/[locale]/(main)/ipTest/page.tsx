"use client";

import { useEffect, useState } from "react";

const IpTest = () => {
  const [ipAddress, setIpAddress] = useState("");
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => {
        setIpAddress(data.ip);
        console.log("Client IP:", data.ip);
      });
  }, []);

  return (
    <div>
      <p>Ip Address :: {ipAddress}</p>
    </div>
  );
};

export default IpTest;
