const express = require("express");
const cors = require("cors");
const compression = require("compression");
const { createProxyMiddleware } = require("http-proxy-middleware");
const request = require("request");
const mcache = require("memory-cache");
const app = express();
const sanitize = require("sanitize-filename");
const fs = require("fs");

const portNumber = 3000;
const sourceDir = "dist";
const IRISH_RAIL_API = "http://api.irishrail.ie/realtime/realtime.asmx/";

const debugDir = "./debug";
const isDev = process.env.NODE_ENV === "dev";

const whitelist = [
  "http://localhost:8080",
  "https://localhost:8080",
  "http://www.reactrail.com",
  "https://www.reactrail.com",
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
 * Provider function that returns a cache middleware for Express. If in dev environment,
 * the debug cache middleware will be used, otherwise the real cache middleware will be used.
 *
 * @returns either debug cache or real cache middleware depending on environment
 */
const dynamicCacheMiddleware = () => {
  if (isDev) {
    console.log("[Dynamic Cache Middleware] Using DEBUG cache");
    return debugCacheMiddleware();
  }

  console.log("[Dynamic Cache Middleware] Using REAL cache");
  return cacheMiddleware();
};

/**
 * Helper method for writing debug files out of the cache middleware.
 * @param {string} url
 * @param {string} data
 */
const writeDebug = (url, data) => {
  const fp = `${debugDir}/${sanitize(url)}.xml`;
  fs.writeFile(fp, data, (err) => console.warn(err));
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
      console.log("Serving cached", req.url);
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
 * Middleware that only provides debug data from local filesystems and blocks all other requests.
 *
 * When used, overrides some parameters of the request to match debug request:
 *  - sets [t|T]rainDate=0
 *  - adds debug=1
 *  - removes "/proxy" prefix if present
 *
 * Debug files should include all stations, with the train data for Connolly and Maynooth.
 * All other endpoints will return nothing.
 */
const debugCacheMiddleware = () => {
  return (req, res, next) => {
    // Clean up request to match cached key
    const url = new URL("https://example.com" + req.url.replace("/proxy", ""));
    if (url.searchParams.has("TrainDate")) {
      url.searchParams.set("TrainDate", "0");
    }
    if (url.searchParams.has("trainDate")) {
      url.searchParams.set("trainDate", "0");
    }
    url.searchParams.set("debug", "1");

    const key = `__api__${sanitize(
      url.href.replace("https://example.com", "")
    )}.xml`;

    // Try get and return cached body
    const filepath = `${debugDir}/${key}`;
    if (fs.existsSync(filepath)) {
      console.log(`DEBUG CACHE: ${key}`);
      fs.readFile(filepath, (err, data) => res.send(data));
      return;
    }
    console.log(`NO CACHE FOR: ${req.url}`);
    res.send();
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
  dynamicCacheMiddleware(),
  createProxyMiddleware(proxyMiddlewareOptions)
);

app.get("/route", dynamicCacheMiddleware(), (req, res) => {
  const url = `${IRISH_RAIL_API}getTrainMovementsXML?TrainId=${req.query.trainCode}&TrainDate=${req.query.trainDate}`;
  request.get(url, { json: false }, (error, response, body) => {
    if (error) {
      res.status(400).send(error);
    }
    res.write(Buffer.from(body));
    res.end();
  });
});

app.listen(process.env.PORT ? process.env.PORT : portNumber, () => {
  console.log(`Express web server started: http://localhost:${portNumber}`);
  console.log(`Serving content from /${sourceDir}/`);
});
