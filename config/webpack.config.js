const path = require("path");

module.exports = {
  entry: "./src/index.tsx", // 진입 파일 (React 기준)
  output: {
    path: path.resolve(__dirname, "dist"), // 번들링된 파일의 출력 위치
    filename: "bundle.js", // 출력 파일 이름
  },
  resolve: {
    alias: {
      "@root": path.resolve(__dirname, "../"), // 별칭 설정
    },
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"], // 해석할 확장자
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/, // JS, TS 파일 처리
        exclude: /node_modules/,
        use: "babel-loader", // Babel을 사용한 변환
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"], // CSS 파일 처리
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"), // 정적 파일 경로
    },
    port: 3000, // 개발 서버 포트
  },
};
