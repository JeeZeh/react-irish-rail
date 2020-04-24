const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();
const portNumber = 3000;
const sourceDir = "dist";

const whitelist = [
  "http://localhost:8080",
  "https://react-rail.herokuapp.com/",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`"${origin}" Not allowed by CORS`));
    }
  },
};

app.use(express.static(sourceDir));

app.listen(process.env.PORT ?  process.env.PORT : portNumber, () => {
  console.log(`Express web server started: http://localhost:${portNumber}`);
  console.log(`Serving content from /${sourceDir}/`);
});

const options = {
  target: "http://api.irishrail.ie/realtime/realtime.asmx/",
  changeOrigin: true,
  ws: true,
};

app.use("/", cors(corsOptions), createProxyMiddleware(options));
