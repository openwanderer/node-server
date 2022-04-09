# OpenWanderer Server 2

A re-implementation of the OpenWanderer server in Node.js and Express.

API endpoints
-------------

The following API endpoints are available with an OpenWanderer server. Note that Express route parameter syntax is used in this documentation, so that for example `:lon` is a placeholder for longitude, and `:id([0-9]+)` is a placeholder for an ID which must be numeric.

Note that these have been modified in some cases compared to the PHP server. Note also that no authentication facilities are provided - the expectation is that you provide your own middleware for this if needed.

`GET /panorama/:id([0-9]+)` - retrieves information about a panorama. Returns a JSON object containing `id`, `lon`, `lat`, `ele` (elevation), `seqid` (the ID of the sequence it belongs to, if it does), `poseheadingdegrees` (the XMP PoseHeadingDegrees property, i.e. bearing of the panorama's centre point, if present) and corrections for the three rotation angles for the panorama: `pancorrection`, `tiltcorrection` and `rollcorrection` (note that these are *corrections*, not absolute values, i.e. the amount which the panorama needs to be rotated to be in its correct orientation if the inherent XMP data is inaccurate).  

`GET /panorama/:id([0-9]+).jpg` - retrieves the actual panorama with the given ID. 

`DELETE /panorama/:id([0-9]+)` - deletes the given panorama. 

`GET /panorama/nearest/:lon/:lat` - will retrieve the nearest panorama to a given latitude and longitude.

`GET /panorama/nearby/:lon/:lat/:limit` - will retrieve the nearby panoramas to a given latitude and longitude within a given distance (`limit`) in metres.

`GET /panorama/all` - retrieves panoramas by bounding box. Expects a query string parameter `bbox` containing a comma-separated list of bounding box parameters in order west, south, east and north.

`POST /panorama/:id([0-9]+)/rotate` - sets the pan, tilt and roll corrections to the values supplied in a JSON object containing `pan`, `tilt` and `roll` fields, sent in the request body. 

`POST /panorama/:id([0-9]+)/move` - moves the panorama position to the given latitude and longitude, supplied as `lat` and `lon` fields within a JSON object sent in the request body. 

`POST /panorama/moveMulti` - moves multiple panoramas. A JSON array containing JSON objects as specified in `move`, above, **with the addition of an `id` field containing the ID for each panorama**, should be supplied.

`POST /panorama/upload` - uploads a panorama, supplied as POST data `file` with a type of `file`. Returns JSON object with an `id` field containing the allocated panorama ID.

`POST /panorama/sequence/create` - creates a new sequence. Expects a JSON array containing the panorama IDs which will make up the sequence, in intended sequence order, sent within the request body. Returns JSON object with a `seqid` field containing the allocated sequence ID.

`GET /panorama/sequence/:id([0-9]+)` - retrieves a sequence, with the full details of the panoramas contained within it (see `GET /panorama/:id` above) as a JSON array of objects.


Environment variables
---------------------

Configuring the Openwanderer-server is done through environment-variables. Following variables are currently supported and should be provided:

- `PANO_DIR` - the directory where panorama files will be served from.
- `RAW_UPLOADS` - the directory where panorama files will be uploaded to. This may be different to `PANO_DIR` to allow for processing steps (e.g. anonymisation, etc).
- `TMPDIR` - a temporary directory used during the upload process.
- `MAX_FILE_SIZE` - the maximum file size to accept for panoramas, in MB. 
- `DB_USER` - your database user.
- `DB_HOST` - database hostname.
- `DB_DBASE` - the database holding the panoramas.

OpenWanderer supports the `.env` file format to control environment variables. In case you want to use a `.env`-file for setting the required environment variables, you should create one in the root directory for your OpenWanderer app.

See the `.env.example` file for an example.

Updates
-------

v0.3.0 (2022-04-09): now initialise server via function taking Express app object as an argument, to allow easier addition of custom middleware elsewhere in app. Update dependencies.
