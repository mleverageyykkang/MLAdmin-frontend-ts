const path = require("path");
module.exports = function override(config) {
  config.resolve.alias = {
    ...config.resolve.alias,
    "@common": path.resolve(__dirname, "common"), // 외부 경로 추가
  };
  return config;
};
