const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();
const portNumber = 3000;
const sourceDir = "dist";

app.use(express.static(sourceDir));

const options = {
  target: "http://api.irishrail.ie/realtime/realtime.asmx/",
  changeOrigin: true,
  ws: true,
};

app.use("/", createProxyMiddleware(options));


app.listen(portNumber, () => {
  console.log(`Express web server started: http://localhost:${portNumber}`);
  console.log(`Serving content from /${sourceDir}/`);
});

