const router = require("express").Router();
const Post = require("../models/post-model");
const Customer = require("../models/customer");
const moment = require("moment");

const authCheck = (req, res, next) => {
  console.log(req.originalUrl);
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    res.redirect("/auth/login");
  } else {
    next();
  }
};

router.get("/", authCheck, async (req, res) => {
  let postFound = await Post.find({ author: req.user._id });
  let data = await Customer.find({ author: req.user._id });
  let healthSum = 0;
  let savingSum = 0;
  data.forEach((customer) => {
    healthSum += customer.product.health;
    savingSum += customer.product.saving;
  });

  res.render("profile", {
    user: req.user,
    data,
    healthSum,
    savingSum,
    posts: postFound,
  });
});

router.get("/post", authCheck, (req, res) => {
  res.render("post", { user: req.user });
});

router.post("/post", authCheck, async (req, res) => {
  let { title, content } = req.body;
  let newPost = new Post({ title, content, author: req.user._id });
  try {
    await newPost.save();
    res.status(200).redirect("/profile");
  } catch (err) {
    req.flash("error_msg", "Both title and content are required.");
    res.redirect("/profile/post");
  }
});

router.get("/customers", authCheck, async (req, res) => {
  try {
    let data = await Customer.find({ author: req.user._id });
    res.render("customers.ejs", { user: req.user, data, moment: moment });
  } catch {
    res.send("error with finding data");
  }
});

router.get("/customers/insert", authCheck, (req, res) => {
  res.render("customerInsert.ejs", { user: req.user });
});

router.post("/customers/insert", authCheck, (req, res) => {
  let { id, name, sex, age, health, saving, lastbuy } = req.body;
  let newCustomer = new Customer({
    id,
    name,
    sex,
    age,
    product: { health, saving },
    lastbuy,
    author: req.user._id,
  });
  newCustomer
    .save()
    .then(() => {
      console.log("customer accepted");
      res.render("accept.ejs", { user: req.user });
    })
    .catch((e) => {
      console.log("customer not accepted");
      console.log(e);
      res.render("reject.ejs", { user: req.user });
    });
});

router.get("/customers/edit/:id", authCheck, async (req, res) => {
  let { id } = req.params;
  try {
    let data = await Customer.findOne({ id });
    if (data !== null) {
      res.render("edit.ejs", { user: req.user, data });
    } else {
      res.send("cannot find this student");
    }
  } catch {
    res.send("error");
  }
});

router.put("/customers/edit/:id", authCheck, async (req, res) => {
  let { id, name, sex, age, health, saving, lastbuy } = req.body;
  try {
    let d = await Customer.findOneAndUpdate(
      { id },
      { id, name, sex, age, product: { health, saving }, lastbuy },
      { new: true, runValidators: true }
    );
    res.redirect("/profile/customers/");
  } catch {
    res.render("reject.ejs", { user: req.user });
  }
});

router.delete("/customers/delete/:id", authCheck, (req, res) => {
  console.log(req.params);
  let { id } = req.params;
  Customer.deleteOne({ id })
    .then((meg) => {
      console.log(meg);
      res.render("delete.ejs", { user: req.user });
    })
    .catch((e) => {
      console.log(e);
      res.send("delete Failed");
    });
});

module.exports = router;
