"use client";
import { useState } from "react";
import { uploadFile } from "./supabase";

function resizeImage(file: File, maxWidth = 1200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob); else reject(new Error("Resize failed"));
      }, "image/jpeg", 0.85);
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = URL.createObjectURL(file);
  });
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, bucket = "avatars", path?: string) => {
    setUploading(true);
    setError(null);
    try {
      const resized = await resizeImage(file);
      const filePath = path || `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const url = await uploadFile(bucket, filePath, resized, "image/jpeg");
      return url;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error };
}
