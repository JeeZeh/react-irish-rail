const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();
const portNumber = 3000;
const sourceDir = "dist";

app.use(express.static(sourceDir));

app.listen(portNumber, () => {
  console.log(`Express web server started: http://localhost:${portNumber}`);
  console.log(`Serving content from /${sourceDir}/`);
});

const whitelist = [
  "http://localhost:3000",
  "http://localhost:8080",
  "https://react-rail.herokuapp.com/",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

const options = {
  target: "http://api.irishrail.ie/realtime/realtime.asmx/",
  changeOrigin: true,
  ws: true,
};

app.use("/", cors(corsOptions), createProxyMiddleware(options));
