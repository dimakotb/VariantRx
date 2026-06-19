/** Read env at access time so values are available after dotenv.config(). */
module.exports = {
  get preprocessVersion() {
    return process.env.PREPROCESS_VERSION || 'kaggle-v0';
  },
  get pathnetModelVersion() {
    return process.env.PATHNET_MODEL_VERSION || 'mock-v0';
  },
  get drugnetModelVersion() {
    return process.env.DRUGNET_MODEL_VERSION || 'mock-v0';
  },
  get mlServiceUrl() {
    return process.env.ML_SERVICE_URL || '';
  },
};
