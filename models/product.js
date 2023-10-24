const mongoose = require("mongoose");
// To create new tables
const Schema = mongoose.Schema;

// Creating table Schema
const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    // The Name in the Model
    ref: "User",
    required: true,
  },
});

// Giving a name to the document
module.exports = mongoose.model("Product", productSchema);
// const getDb = require("../util/database").getDb;
// const mongodb = require("mongodb");
// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? id : null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOb;

//     if (this._id) {
//       dbOb = db
//         .collection("products")
//         .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: this });
//     } else {
//       dbOb = db.collection("products").insertOne(this);
//     }
//     return dbOb;
//     //  If It doesn't exist it will create it
//     // db.collection("products").insertOne({ name: "A book", price: 13 });
//   }

//   static fetchAll() {
//     const db = getDb();

//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then((products) => {
//         return products;
//       })
//       .catch();
//   }

//   static findById(prodId) {
//     const db = getDb();

//     return db
//       .collection("products")
//       .find({ _id: new mongodb.ObjectId(prodId) })
//       .next()
//       .then((product) => {
//         return product;
//       });
//   }

//   static deleteById(prodId) {
//     const db = getDb();

//     return db
//       .collection("products")
//       .deleteOne({ _id: new mongodb.ObjectId(prodId) })
//       .then((result) => {
//         console.log("deleted");
//       });
//   }
// }

// // // const getProductsFromFile = (cb) => {
// // //   fs.readFile(p, (err, fileContent) => {
// // //     if (err) {
// // //       cb([])
// // //     } else {
// // //       cb(JSON.parse(fileContent))
// // //     }
// // //   })
// // // }

// // module.exports = class Product {
// //   constructor(id, title, imageUrl, description, price) {
// //     this.id = id
// //     this.title = title
// //     this.imageUrl = imageUrl
// //     this.description = description
// //     this.price = price
// //   }

// //   save() {
// //     return db.execute(
// //       "INSERT INTO products (title , price , imageUrl , description) VALUES (? , ? , ? ,?)",
// //       [this.title, this.price, this.imageUrl, this.description]
// //     )
// //   }

// //   static deleteById(id) {}

// //   // static makes the function available for the class  as total not the objects
// //   static fetchAll() {
// //     return db.execute("SELECT * FROM products")
// //   }

// //   static findById(id) {
// //     return db.execute("SELECT * FROM products WHERE products.id = ? ", [id])
// //   }
// // }

// const Sequelize = require("sequelize");

// // Connection pool and some configurations
// // const sequelize = require("../util/database");

// // const Product = sequelize.define("product", {
// //   id: {
// //     type: Sequelize.INTEGER,
// //     autoIncrement: true,
// //     allowNull: false,
// //     primaryKey: true,
// //   },
// //   title: Sequelize.STRING,
// //   price: {
// //     type: Sequelize.DOUBLE,
// //     allowNull: false,
// //   },
// //   imageUrl: {
// //     type: Sequelize.STRING,
// //     allowNull: false,
// //   },
// //   description: {
// //     type: Sequelize.STRING,
// //     allowNull: false,
// //   },
// // });

// module.exports = Product;
