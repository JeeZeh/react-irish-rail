const express = require("express");
const cors = require("cors");
const compression = require("compression");
const { createProxyMiddleware } = require("http-proxy-middleware");
const request = require("request");
const mcache = require("memory-cache");
const app = express();

const portNumber = 3000;
const sourceDir = "dist";
const IRISH_RAIL_API = "http://api.irishrail.ie/realtime/realtime.asmx/";

// TODO: Cache requests server side
// TODO: Maybe keep long-term cache of trainCode->journey

const whitelist = [
  "http://localhost:3333",
  "https://localhost:3333",
  "http://react-rail.herokuapp.com/",
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

const proxyMiddlewareOptions = {
  target: IRISH_RAIL_API,
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    "^/proxy": "",
  },
};

/**
 * Cache used for requests
 * @param {number} duration milliseconds to keep cached value
 * @param {string} keyPrefix prefix to apply to the cache key
 */
const cacheMiddleware = (duration, keyPrefix) => {
  return (req, res, next) => {
    const key = `__express__${keyPrefix}__${req.originUrl || req.url}_${
      req.params
    }`;
    const cachedBody = mcache.get(key);
    if (cachedBody) {
      res.send(cachedBody);
      return;
    }

    res.sendResponse = res.send;
    res.send = (body) => {
      mcache.put(key, body, duration);
      res.sendResponse(body);
    };
    next();
  };
};

/**
 * Returns the number of milliseconds until the provided hour (on the dot)
 * @param {number} hour
 */
let msUntil = (hour) => {
  let d = new Date(),
    e = new Date(d);
  return e - d.setHours(hour, 0, 0, 0, 0) < 0
    ? d - e
    : 24 * 60 * 60 * 1000 - (e - d);
};

app.use(compression(), cors(corsOptions));
app.use(express.static(sourceDir));

app.use("/proxy/", createProxyMiddleware(proxyMiddlewareOptions));

app.get(
  "/route/:trainCode",
  cacheMiddleware(msUntil(4), "route"),
  (req, res) => {
    request.get(
      `${IRISH_RAIL_API}getTrainMovementsXML?TrainId=${req.params.trainCode}&TrainDate=0`,
      { json: false },
      (error, response, body) => {
        if (error) {
          res.status(400).send(error);
        }
        res.send(body);
      }
    );
  }
);

app.listen(process.env.PORT ? process.env.PORT : portNumber, () => {
  console.log(`Express web server started: http://localhost:${portNumber}`);
  console.log(`Serving content from /${sourceDir}/`);
});
