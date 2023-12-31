const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExp: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() == product._id.toString();
  });

  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }

  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter(
    (i) => i.productId.toString() != productId.toString()
  );

  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};
module.exports = mongoose.model("User", userSchema);

// const mongodb = require("mongodb");
// const { get } = require("../routes/admin");
// const getDb = require("../util/database").getDb;

// const ObjectId = mongodb.ObjectId;
// class User {
//   constructor(username, email, cart, _id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart; // {items:[]}
//     this._id = _id;
//   }

//   save() {
//     const db = getDb();

//     return db.collection("users").insertOne(this);
//   }

//   addToCart(product) {
//     cartProductIndex = this.cart.items.findIndex((cp) => {
//       return cp.productId.toString() == product._id.toString();
//     });

//     console.log(this.cart.items);
//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];

//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new ObjectId(product._id),
//         quantity: newQuantity,
//       });
//     }

//     const updatedCart = {
//       items: updatedCartItems,
//     };

//     const db = getDb();

//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   getCart() {
//     let productIds = [];
//     const db = getDb();
//     if (this.cart.items) {
//       productIds = this.cart.items.map((i) => {
//         return i.productId;
//       });
//     }

//     // $in cursor for all products that matches id in the array
//     return db
//       .collection("products")
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then((products) => {
//         return products.map((p) => {
//           return {
//             ...p,
//             quantity: this.cart.items.find(
//               (i) => i.productId.toString() == p._id
//             ).quantity,
//           };
//         });
//       });
//   }

//   deleteItemFromCart(productId) {
//     const updatedCartItems = this.cart.items.filter(
//       (i) => i.productId.toString() != productId.toString()
//     );

//     const db = getDb();

//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: updatedCartItems } }
//       );
//   }

//   addOrder() {
//     const db = getDb();
//     return this.getCart()
//       .then((products) => {
//         const order = {
//           items: products,
//           user: {
//             _id: new ObjectId(this._id),
//             name: this.name,
//             email: this.email,
//           },
//         };
//         return db.collection("orders").insertOne(order);
//       })

//       .then((result) => {
//         this.cart = { items: [] };

//         return db
//           .collection("users")
//           .updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: [] } });
//       });
//   }

//   getOrders() {
//     const db = getDb();
//     return db
//       .collection("orders")
//       .find({ "user._id": new ObjectId(this._id) })
//       .toArray();
//   }

//   static findById(userId) {
//     const db = getDb();

//     // findOne doesn't return a cursor so we don't need .next()
//     return db
//       .collection("users")
//       .find({ _id: new ObjectId(userId) })
//       .next();
//   }
// }

// module.exports = User;
