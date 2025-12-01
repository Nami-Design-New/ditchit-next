import { getCookie } from "../utils";

export type FileInfo = {
  name: string;
  size: number;
  url: string;
};

export const getFileInfoFromBlob = (file: File): Promise<FileInfo> => {
  return Promise.resolve({
    name: file.name,
    size: file.size,
    url: URL.createObjectURL(file),
  });
};
const countryId = getCookie("countryId");
export const getFileInfoFromUrl = async (
  url: string,
  fileName?: string
): Promise<FileInfo> => {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        Accept: "*/*",
        country: countryId || "",
      },
    });

    const sizeHeader = response.headers.get("Content-Length");
    const size = sizeHeader ? parseInt(sizeHeader, 10) : 0;

    let extractedName = fileName;
    if (!extractedName) {
      try {
        const urlObj = new URL(url);
        const pathSegments = urlObj.pathname.split("/");
        extractedName = pathSegments[pathSegments.length - 1];

        extractedName = extractedName.split("?")[0];
        extractedName = decodeURIComponent(extractedName);

        if (!extractedName || extractedName === "") {
          extractedName = "file";
        }
      } catch (error) {
        console.warn("Error parsing URL for filename extraction", error);
        extractedName = "file";
      }
    }

    return {
      name: extractedName,
      size,
      url,
    };
  } catch (error) {
    console.warn("Failed to fetch file info from URL", error);

    let fallbackName = fileName;
    if (!fallbackName) {
      try {
        const urlObj = new URL(url);
        const pathSegments = urlObj.pathname.split("/");
        fallbackName =
          pathSegments[pathSegments.length - 1].split("?")[0] || "file";
        fallbackName = decodeURIComponent(fallbackName);
      } catch {
        fallbackName = "file";
      }
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return {
        name: fallbackName,
        size: blob.size,
        url,
      };
    } catch (secondError) {
      console.warn("Failed second attempt to get file size", secondError);
      return {
        name: fallbackName,
        size: 0,
        url,
      };
    }
  }
};

export const getFileInfo = (
  fileOrUrl: File | string,
  fileName?: string
): Promise<FileInfo> => {
  return typeof fileOrUrl === "string"
    ? getFileInfoFromUrl(fileOrUrl, fileName)
    : getFileInfoFromBlob(fileOrUrl);
};

export const formatFileSize = (
  bytes: number,
  precision: number = 1
): string => {
  if (!bytes || isNaN(bytes)) return "0 KB";

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(precision)} KB`;
  } else {
    const mb = kb / 1024;
    return `${mb.toFixed(precision + 1)} MB`;
  }
};
