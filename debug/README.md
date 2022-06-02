# Debug Files

Files in this folder drive the `debugCacheMiddleware()` in `express.js`.

This is a middleware that only provides data from this folder and blocks all other requests. This middleware is active when `NODE_ENV=dev`. Zeroes out any time-specific data in the incoming request (e.g. `trainDate`) and appends `debug=1`, just in case implementation of debug API mode is changed in the future.

Debug files include allStationsXML for basic site functionality, with the train data for Connolly and Maynooth.
