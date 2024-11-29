const express = require("express"); // Requires the Express module
const propertiesReader = require("properties-reader");
const path = require("path");
const fs = require("fs");
const { ObjectId } = require("mongodb");
const cors = require('cors');
const app = express(); 

// Load properties from db.properties
let propertiesPath = path.resolve(__dirname, "database_config/db.properties");
let properties = propertiesReader(propertiesPath);
let dbPprefix = properties.get("db.prefix");

// URL-Encoding of User and PWD for potential special characters
let dbUsername = encodeURIComponent(properties.get("db.username"));
let dbPassword = encodeURIComponent(properties.get("db.password"));
let dbName = properties.get("db.name");
let dbUrl = properties.get("db.dbURL");

// Construct MongoDB connection URI
const uri = dbPprefix + dbUsername + ":" + dbPassword + dbUrl + "/" + dbName;

// Importing MongoDB client
const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
let db;

// Connecting to MongoDB
client.connect()
.then(() => {
console.log("Connected to MongoDB");
db = client.db(dbName);

// Checking if the connection is successful and listing the collections
db.listCollections().toArray().then((collections) => {
console.log("Available collections:", collections.map(c => c.name));
}).catch(console.error);
})
.catch(err => {
console.error("Error connecting to MongoDB:", err);
process.exit(1); // Exit if connection fails
});

//Using CORS
app.use(cors());

// Middleware to log requests
app.use((req, res, next) => {
    console.log("Request URL:", req.url);
    console.log("Request Date:", new Date());
    next();
    });

    // MongoDB route for collections
    app.param("collectionName", function (req, res, next, collectionName) {
    req.collection = db.collection(collectionName);
    return next();
    });

    //Route to fetch documents from specific collection
    app.get("/collections/:collectionName", async (req, res, next) => {
    try {
    const results = await req.collection.find({}).toArray();
    res.json(results);
    } catch (error) {
    next(error);
      }
    });

//Console log for listening to local port
const port = process.env.PORT || 3000;
app.listen(port, function() {
console.log("App started on port: " + port);
});