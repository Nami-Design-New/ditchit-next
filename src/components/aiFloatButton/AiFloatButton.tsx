"use client";

import { useState } from "react";
import ChooseValueModal from "./ChooseValueModal";
import ResultValueModal from "./ResultValueModal";
import Image from "next/image";
import clientAxios from "@/lib/axios/clientAxios";

interface PriceData {
  value: number | null;
  currency: string | null;
}

export interface ApiResponse {
  success: boolean;
  product_name: string | null;
  lowest_price: PriceData;
  average_price: PriceData;
  highest_price: PriceData;
}

const AiFloatButton = () => {
  const [showModalAi, setShowModalAi] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageProcess = async (file: File) => {
    if (!file) return;

    setSelectedImage(file);
    setLoading(true);
    setError(null);
    setShowResultModal(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      // formData.append("country", country || "");

      const response = await clientAxios.post(
        "/home/getAverageByImage",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setApiData(response?.data?.data);
      setShowModalAi(false);
      setShowResultModal(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        console.error("Error processing image:", err);
      } else {
        setError("An error occurred");
        console.error("Error processing image:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <div
        onClick={() => setShowModalAi(true)}
        className="fixed bottom-8 right-6 z-50 animate-bounce cursor-pointer"
      >
        <Image
          width={500}
          height={500}
          src="/icons/aiFloatIcon.svg"
          alt="AI Float Button"
          className="w-22 h-22 cursor-pointer hover:opacity-80"
        />
      </div>

      {/* First Modal - Image Selection */}
      <ChooseValueModal
        showModalAi={showModalAi}
        setShowModalAi={setShowModalAi}
        onImageSelect={handleImageProcess}
        loading={loading}
      />

      {/* Second Modal - Result */}
      <ResultValueModal
        showResultModal={showResultModal}
        setShowResultModal={setShowResultModal}
        selectedImage={selectedImage}
        apiData={apiData}
        loading={loading}
        error={error}
      />
    </>
  );
};

export default AiFloatButton;
