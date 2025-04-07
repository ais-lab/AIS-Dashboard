"use client"

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("d3398bde-3e64-4bbe-a2ad-75e3bc5207e1");
  });

  return null;
}

export default CrispChat;