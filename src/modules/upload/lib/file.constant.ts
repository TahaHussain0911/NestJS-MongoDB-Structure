export const MIME_TYPES = {
  IMAGE: {
    JPG: 'image/jpeg',
    JFIF: 'image/jfif',
    PNG: 'image/png',
    GIF: 'image/gif',
    WEBP: 'image/webp',
    SVG: 'image/svg+xml',
  },

  DOCUMENT: {
    PDF: 'application/pdf',
    TEXT: 'text/plain',
    CSV: 'text/csv',
    HTML: 'text/html',
  },

  AUDIO: {
    MP3: 'audio/mpeg',
    WAV: 'audio/wav',
    OGG: 'audio/ogg',
  },

  VIDEO: {
    MP4: 'video/mp4',
    MOV: 'video/quicktime',
    WEBM: 'video/webm',
  },

  OFFICE: {
    DOC: 'application/msword',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    XLS: 'application/vnd.ms-excel',
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    PPT: 'application/vnd.ms-powerpoint',
    PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },

  ARCHIVE: {
    ZIP: 'application/zip',
    TAR: 'application/x-tar',
    GZIP: 'application/gzip',
  },
};
export const MAX_FILE_SIZE_IN_MBS = 20;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_IN_MBS * 1024 * 1024;
export const READ_SIGNED_URL_EXPIRES_IN = 60 * 60;
export const UPLOAD_SIGNED_URL_EXPIRES_IN = 60 * 60;
