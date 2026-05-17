import imageCompression from "browser-image-compression";

export async function compressProductImage(file: File): Promise<File> {
  // Target ~200-300KB with max dimension 1000px while preserving aspect ratio.
  return imageCompression(file, {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1000,
    useWebWorker: true,
    initialQuality: 0.8,
    fileType: file.type || "image/jpeg",
  });
}
