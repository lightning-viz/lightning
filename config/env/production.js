
/**
 * Expose
 */

module.exports = {
  
  url: process.env.LIGHTNING_URL || process.env.URL,
  baseURL: process.env.LIGHTNING_BASE_URL || '/',
  s3: {
        key: process.env.S3_KEY,
        secret: process.env.S3_SECRET,
        bucket: process.env.S3_BUCKET,
  }
};
