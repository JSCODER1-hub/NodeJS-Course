const path = require("path");

const express = require("express");

const rootDir = require("../util/path");

const router = express.Router();
const { body } = require("express-validator");
const adminController = require("../controllers/admin");

const isAuth = require("../middleware/is-auth");

// We didn't use braces here !!!!!
router.get("/add-product", isAuth, adminController.getAddProduct);

router.post(
  "/add-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5 }).trim(),
  ],

  isAuth,
  adminController.postAddProduct
);

router.get("/products", isAuth, adminController.getProducts);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  [
    body("title").isAlphanumeric().isLength({ min: 3 }).trim(),
    body("imageUrl").isURL().trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5 }).trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

// router.post("/delete-product", isAuth, adminController.postDeleteProduct);

router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
