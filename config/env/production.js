
/**
 * Expose
 */

module.exports = {
  
  url: process.env.LIGHTNING_URL || process.env.URL,
  s3: {
        key: process.env.S3_KEY,
        secret: process.env.S3_SECRET,
        bucket: process.env.S3_BUCKET,
  }
};
