"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef } from "react";
import { toast } from "sonner";

interface ChooseValueModalProps {
  showModalAi: boolean;
  setShowModalAi: (value: boolean) => void;
  onImageSelect: (file: File) => void;
  loading: boolean;
}

const ChooseValueModal = ({
  showModalAi,
  setShowModalAi,
  onImageSelect,
  loading,
}: ChooseValueModalProps) => {
  const t = useTranslations("common");
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleCameraClick = async () => {
    try {
      // Check if device supports camera
      await navigator.mediaDevices.getUserMedia({ video: true });
      // If camera is available, trigger camera input
      cameraInputRef.current?.click();
    } catch {
      // toast.error("This device does not support camera.");
      handleGalleryClick();
    }
  };

  // const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file && file.type.startsWith("image/")) {
  //     onImageSelect(file);
  //   } else {
  //     toast.error("Please select a valid image file");
  //   }
  //   // Reset input value so same file can be selected again
  //   event.target.value = "";
  // };

  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 5MB

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // check type
    if (!file.type.startsWith("image/")) {
      toast.error(t("select_available_image"));
      event.target.value = "";
      return;
    }

    // check size
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(t("image_size"));
      event.target.value = "";
      return;
    }

    onImageSelect(file);

    // Reset input so same file can be selected again
    event.target.value = "";
  };

  return (
    <>
      {loading && <div>loading....</div>}
      <Dialog open={showModalAi} onOpenChange={setShowModalAi}>
        <DialogContent className="sm:max-w-md py-7">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center space-x-2 pt-4">
              <Image
                width={500}
                height={500}
                src="/images/priceOwlAi2.jpeg"
                alt="AI Chat"
                className="w-14 h-14 cursor-pointer hover:opacity-80"
              />
              <span className="ml-2 font-bold">{t("get_estimate")}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="p-[.2px] bg-gray-200"></div>
          <div className="flex justify-between space-x-8 mt-6 w-2/3 mx-auto">
            {/* Camera Option */}
            <div
              onClick={handleCameraClick}
              className="flex flex-col items-center space-y-2 cursor-pointer"
            >
              <div className="w-16 h-16 flex items-center justify-center transition-colors hover:opacity-80">
                <Image
                  width={500}
                  height={500}
                  src="/icons/Layer_1.svg"
                  alt="Camera"
                  className="w-12 h-12 cursor-pointer"
                />
              </div>
              <span className="text-sm text-gray-500 font-medium">
                {t("camera")}
              </span>
            </div>
            <div className="p-[.2px] bg-gray-200"></div>
            {/* Gallery Option */}
            <div
              className="flex flex-col items-center space-y-2 cursor-pointer"
              onClick={handleGalleryClick}
            >
              <div className="w-16 h-16 flex items-center justify-center transition-colors hover:opacity-80">
                <Image
                  width={500}
                  height={500}
                  src="/icons/Vector.svg"
                  alt="Gallery"
                  className="w-12 h-12 cursor-pointer"
                />
              </div>
              <span className="text-sm text-gray-500 font-medium">
                {t("gallery")}
              </span>
            </div>
          </div>

          {/* Camera Input */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Gallery Input */}
          <input
            type="file"
            accept="image/*"
            ref={galleryInputRef}
            className="hidden"
            onChange={handleFileSelect}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChooseValueModal;
