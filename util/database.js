const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://mohamed:12345678910Aa@cluster0.0e8wfii.mongodb.net/shop?retryWrites=true&w=majority"
  )

    .then((client) => {
      console.log("connected");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

// For getting multiple connections (pool of connections)

const getDb = () => {
  if (_db) {
    // return access
    return _db;
  }
  throw "No Database found!";
};
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
