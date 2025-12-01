"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ApiResponse } from "./AiFloatButton";
import { useTranslations } from "next-intl";

interface ResultValueModalProps {
  showResultModal: boolean;
  setShowResultModal: (value: boolean) => void;
  selectedImage: File | null;
  apiData: ApiResponse | null;
  loading: boolean;
  error: string | null;
}

const ResultValueModal = ({
  showResultModal,
  setShowResultModal,
  selectedImage,
  apiData,
  loading,
  error,
}: ResultValueModalProps) => {
  const t = useTranslations("common");
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  useEffect(() => {
    if (selectedImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedImage);
    }
  }, [selectedImage]);

  const formatPrice = (price: number | null, currency: string | null) => {
    if (price === null) return "N/A";
    const currencySymbol = currency === "USD" ? "$" : currency || "$";
    return `${currencySymbol}${price.toLocaleString()}`;
  };

  return (
    <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
      <DialogContent className="sm:max-w-md p-0">
        <CardContent className="p-0">
          <DialogHeader>
            <DialogTitle>
            </DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="w-full h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{t("processing_image")}</p>
              </div>
            </div>
          ) : error ? (
            <div className="w-full h-96 flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-red-600 font-semibold mb-2">Error</p>
                <p className="text-gray-600">{error}</p>
                <Button
                  onClick={() => setShowResultModal(false)}
                  className="mt-4 bg-gray-300 text-gray-800 hover:bg-gray-400"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Image Section */}
              <div className="mb-4">
                {imagePreview && (
                  <Image
                    src={imagePreview}
                    alt="product image"
                    width={500}
                    height={300}
                    className="w-full h-[380px]  rounded-lg"
                  />
                )}
              </div>

              <div className="px-4 py-6">
                {apiData?.success ? (
                  <>
                    {/* Product Info */}
                    <div className="mb-4">
                      <h3 className="font-bold mb-4">
                        {apiData.product_name || "Unknown Product"}
                      </h3>
                      <h3 className="text-xs text-gray-500 mb-1">
                        {t("avg_price")}
                      </h3>
                      <p className="font-bold">
                        {formatPrice(
                          apiData.average_price.value,
                          apiData.average_price.currency
                        )}
                      </p>
                    </div>

                    {/* Min/Max Prices */}
                    <div className="flex space-x-24 text-sm text-gray-600 mb-6">
                      <div className="flex space-x-1 items-center">
                        <p className="text-[10px] font-medium">{t("min")}</p>
                        <span className="text-[11px] text-black font-bold">
                          {formatPrice(
                            apiData.lowest_price.value,
                            apiData.lowest_price.currency
                          )}
                        </span>
                      </div>
                      <div className="flex space-x-1 items-center">
                        <p className="text-[10px] font-medium">{t("max")}</p>
                        <span className="text-[11px] text-black font-bold">
                          {formatPrice(
                            apiData.highest_price.value,
                            apiData.highest_price.currency
                          )}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 text-sm">
                      {t("unable_identify")}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {apiData?.success && (
                  <div className="flex space-x-3">
                    <Button
                      className="flex-1 py-5 rounded-xl text-green-600 border border-green-600 hover:bg-green-600 hover:text-white"
                      onClick={() => {
                        setShowResultModal(false);
                        // const productName = apiData?.product_name || "item";
                        // router.push(
                        //   `/create-post?type=sale&category=${encodeURIComponent(
                        //     productName
                        //   )}`
                        // );
                        router.push(`/create-post?type=sale`);
                      }}
                    >
                      {t("sell")}
                    </Button>
                    <Button
                      className="flex-1 py-5 rounded-xl text-white bg-green-600 hover:bg-green-500"
                      onClick={() => {
                        setShowResultModal(false);
                        const productName = apiData?.product_name || "item";
                        const sliceName = productName
                          ?.split(" ")
                          .slice(0, 3)
                          .join(" ");
                        router.push(
                          `/posts?search=${encodeURIComponent(sliceName)}`
                        );
                      }}
                    >
                      {t("list_similar")}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </DialogContent>
    </Dialog>
  );
};

export default ResultValueModal;
