// Resize an image file client-side before upload.
// Returns a Blob (JPEG) capped at maxWidth, with the given quality.
// GIFs and videos are returned unchanged to preserve animation/format.

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

      // If already under maxWidth, just compress to JPEG
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          // Preserve original name but switch extension
          const name = file.name.replace(/\.[^.]+$/, ".jpg");
          resolve(new File([blob], name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // On error, return original
    };

    img.src = url;
  });

export default resizeImage;
