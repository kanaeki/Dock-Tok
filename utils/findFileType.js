const imageMimeTypes = [
  "image/jpeg", // JPEG
  "image/png", // PNG
  "image/gif", // GIF
  "image/bmp", // BMP
  "image/tiff", // TIFF
  "image/x-photoshop", // PSD
  "image/heif", // HEIF
  "image/heic", // HEIC
  "image/svg+xml", // SVG
  "application/postscript", // EPS
  "application/pdf", // PDF
  "image/vnd.adobe.photoshop", // AI (Adobe Illustrator)
  "image/webp", // WEBP
  "image/x-icon", // ICO
  "image/vnd.zbrush.pcx", // PCX
  // Note: RAW formats (like CR2, NEF, ARW) might not have a single MIME type as they vary by camera manufacturer
];

const videoMimeTypes = [
  "video/mp4", // MP4
  "video/x-msvideo", // AVI
  "video/x-matroska", // MKV
  "video/quicktime", // MOV
  "video/x-ms-wmv", // WMV
  "video/x-flv", // FLV
  "video/webm", // WEBM
  "video/mpeg", // MPEG
  "video/mpeg", // MPG
  "video/3gp", // 3GP
  "video/mp4", // M4V
  "video/ogg", // OGV
  "video/MP2T", // TS
  "video/vob", // VOB
  "application/x-shockwave-flash", // SWF
];

exports.findFileType = (file) => {
  if (imageMimeTypes.includes(file.mimetype)) {
    return "image";
  } else if (videoMimeTypes.includes(file.mimetype)) {
    return "video";
  } else "other";
};
