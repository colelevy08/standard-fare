// Resize an image file client-side before upload.
// Returns a Blob capped at maxWidth, with the given quality.
// Outputs WebP when the browser supports it (30-50% smaller than JPEG),
// falls back to JPEG otherwise.
// GIFs and videos are returned unchanged to preserve animation/format.

// Feature-detect WebP support once at module load
let _supportsWebP = null;
const supportsWebP = () => {
  if (_supportsWebP !== null) return _supportsWebP;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    _supportsWebP = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    _supportsWebP = false;
  }
  return _supportsWebP;
};

const resizeImage = (file, maxWidth = 1800, quality = 0.85) =>
  new Promise((resolve) => {
    // Skip non-static-image files (GIFs, videos)
    if (!file.type.startsWith("image/") || file.type === "image/gif") {
      return resolve(file);
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);

      // Use WebP for ~40% smaller files, fall back to JPEG
      const useWebP = supportsWebP();
      const mimeType = useWebP ? "image/webp" : "image/jpeg";
      const ext = useWebP ? "webp" : "jpg";

      canvas.toBlob(
        (blob) => {
          const name = file.name.replace(/\.[^.]+$/, `.${ext}`);
          resolve(new File([blob], name, { type: mimeType }));
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });

export default resizeImage;
