import { Application } from "express";
import { createProxyMiddleware, RequestHandler } from "http-proxy-middleware";

module.exports = function (app: Application): void {
  app.use(
    createProxyMiddleware({
      target: "http://localhost:20220",
      changeOrigin: true,
    }) as RequestHandler
  );
};
