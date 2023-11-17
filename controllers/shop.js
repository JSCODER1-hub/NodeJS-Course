const Product = require("../models/product");
const fs = require("fs");
const path = require("path");
const Order = require("../models/order");
const { getDb } = require("../util/database");
const PDFDocument = require("pdfkit");
const { totalmem } = require("os");
const ITEMS_PER_PAGE = 2;
const stripe = require("stripe")(process.env.STRIPE_KEY);

exports.getProducts = (req, res, next) => {
  //   console.log("In Another the Middleware");
  //   //  The end is here
  //   res.send("<h1>Hello from express </h1>");
  //   dir name public variable for current folder it works on linux systems and pc and mac
  // console.log(adminData.products);
  // res.sendFile(path.join(__dirname, "../", "views", "shop.html"));

  // will use the setted templating engine to render content
  // we already set the path
  // the function in the fetchall will run once fetchAll is Done Cause it's a call back function

  Product.find()
    // .cursor() to get a cursor
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));

  // Product.fetchAll()
  //   .then(([rows, fieldData]) => {
  //     console.log(rows);
  //     res.render("shop/product-list", {
  //       prods: rows,
  //       pageTitle: "All Products",
  //       path: "/products",
  //     });
  //   })
  //   .catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  // This is another
  // this find multiple elements
  // Product.findAll({ Where: { id: prodId } })
  //   .then((products) => {
  //     res.render("shop/product-detail", {
  //       pageTitle: products[0].title,
  //       path: "/products",
  //       product: products[0],
  //     });
  //   })
  //   .catch((err) => console.log(err));

  // This is the easy way
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        pageTitle: product.title,
        path: "/products",
        product: product,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  //   console.log("In Another the Middleware");
  //   //  The end is here
  //   res.send("<h1>Hello from express </h1>");
  //   dir name public variable for current folder it works on linux systems and pc and mac
  // console.log(adminData.products);
  // res.sendFile(path.join(__dirname, "../", "views", "shop.html"));
  // will use the setted templating engine to render content
  // we already set the path
  // the function in the fetchall will run once fetchAll is Done Cause it's a call back function
  const page = req.query.page;
  Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));

  // Product.fetchAll()
  //   .then(([rows, fieldData]) => {
  //     res.render("shop/index", {
  //       prods: rows,
  //       pageTitle: "Shop",
  //       path: "/",
  //     })
  //   })
  //   .catch((err) => console.log(err))
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        isAuthenticated: req.session.isLoggedIn,
        products,
      });
    })
    .catch();
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(req.user);
      res.redirect("/cart");
    });
};

exports.getOrders = (req, res, next) => {
  Order.find()
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch();
};

exports.postCartDelete = (req, res, next) => {
  const prodId = req.body.productId;

  req.user.removeFromCart(prodId).then((result) => {
    res.redirect("/cart");
  });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total;
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      total = 0;
      products = user.cart.items;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });

      console.log("ssdsdsd");
      return stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        // Important
        line_items: products.map((p) => {
          return {
            price_data: {
              unit_amount: p.productId.price * 100,
              currency: "usd",
              product_data: {
                name: p.productId.title,
              },
            },
            quantity: p.quantity,
          };
        }),
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total,
        sessionId: session.id,
      });
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        // _doc to get the only data
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      order.save();
    })
    .then((result) => {
      req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch();
};
exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        // _doc to get the only data
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      order.save();
    })
    .then((result) => {
      req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch();
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No Order Found"));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      // !!!!!! To Create PDF File !!!!!!!!!!!!!!

      const pdfDoc = new PDFDocument();

      // Readable stream
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      // Then download or print it
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });
      pdfDoc.text("-------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              "-" +
              prod.quantity +
              " x $" +
              prod.product.price
          );
      });
      pdfDoc.text("-------------");
      pdfDoc.fontSize(20).text("Total Price : $ " + totalPrice);
      // file is sent
      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader("Content-Type", "application/pdf");
      //   // orientation
      //   res.setHeader(
      //     "Content-Disposition",
      //     "attachment; filename='" + invoiceName + "'"
      //   );
      //   res.send(data);
      // });
      // !!!!!!!!! Good for big files
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader("Content-Type", "application/pdf");
      // //   // orientation
      // res.setHeader(
      //   "Content-Disposition",
      //   "attachment; filename='" + invoiceName + "'"
      // );
      // file.pipe(res);
    })
    .catch((err) => next(err));
};
