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
 */
const cacheMiddleware = () => {
  return (req, res, next) => {
    if (req.method !== "GET") return next();
    const key = "__api__" + req.url;
    const cachedBody = mcache.get(key);
    if (cachedBody) {
      res.send(cachedBody);
      console.log("Serving cached", key);
      return;
    }

    // Set the duration of the cache in ms depending on the data requested
    let cacheTime = 0;
    if (
      req.path === "/proxy/getTrainMovementsXML" ||
      req.path === "/proxy/getStationDataByCodeXML_WithNumMins"
    ) {
      cacheTime = 15000;
    } else if (
      req.path === "/proxy/getAllStationsXML" ||
      req.path === "/route"
    ) {
      cacheTime = msUntil(4);
    }

    const _end = res.end;
    const _write = res.write;
    let buffer = new Buffer.alloc(0);
    // Rewrite response method and get the content.
    res.write = function (data) {
      buffer = Buffer.concat([buffer, data]);
    };
    res.end = function () {
      const body = buffer.toString();
      console.log("Caching", key, "for", cacheTime);
      mcache.put(key, body, cacheTime);
      _write.call(res, body);
      _end.call(res);
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

app.get(
  "/proxy/*",
  cacheMiddleware(),
  createProxyMiddleware(proxyMiddlewareOptions)
);

app.get("/route", cacheMiddleware(), (req, res) => {
  request.get(
    `${IRISH_RAIL_API}getTrainMovementsXML?TrainId=${req.query.trainCode}&TrainDate=0`,
    { json: false },
    (error, response, body) => {
      if (error) {
        res.status(400).send(error);
      }
      res.write(new Buffer(body));
      res.end();
    }
  );
});

app.listen(process.env.PORT ? process.env.PORT : portNumber, () => {
  console.log(`Express web server started: http://localhost:${portNumber}`);
  console.log(`Serving content from /${sourceDir}/`);
});
