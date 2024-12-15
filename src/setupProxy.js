const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/token",
    createProxyMiddleware({
      target: "http://localhost:20220",
      changeOrigin: true,
    })
  );
};
