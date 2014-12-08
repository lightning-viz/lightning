
/**
 * Expose
 */


module.exports = {

    url: 'localhost:3000',
    s3: {
        key: process.env.S3_KEY,
        secret: process.env.S3_SECRET,
        bucket: process.env.S3_BUCKET,
    }
};
