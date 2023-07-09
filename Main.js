const express = require("express"),
  app = express(),
  path = require("path"),
  ejs = require("ejs"),
  cookiepasrser = require("cookie-parser"),
  session = require("express-session"),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  flash = require("connect-flash"),
  connectEnsure = require("connect-ensure-login"),
  bcrypt = require("bcrypt");

const { sequelize } = require("./models");
const { DataTypes } = require("sequelize");

const User = require("./models/userdetail")(sequelize, DataTypes),
  Product = require("./models/productdetail")(sequelize, DataTypes),
  Banner = require("./models/banner")(sequelize, DataTypes),
  Cart = require("./models/usercart")(sequelize, DataTypes);

let viewsPath = path.join(__dirname + "/views");
app.set("views", viewsPath);
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(express.json());

app.use(cookiepasrser("cookie-parser-secret"));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "this_should_be_32_character_long",
    cookie: {
      maxAge: 60 * 60 * 24 * 1000, //24 Hours
    },
  })
);

// app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

//Flash Message
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({
        where: {
          email: username,
        },
      })
        .then(async function (user) {
          if (user) {
            const resultantPass = await bcrypt.compare(password, user.password);
            if (resultantPass) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Invalid Password" });
            }
          } else {
            return done(null, false, { message: "User Does Not Exist" });
          }
        })
        .catch((error) => {
          console.log(error);
          return error;
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serealizing User in Session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

app.use(function (request, response, next) {
  const Message = request.flash();
  response.locals.messages = Message;
  next();
});

app.get("/", async (req, res) => {
  let getProductList = await Product.getAllProduct();
  let getBanners = await Banner.getAllBanners();
  let id = req.cookies ?? false;

  if (id.userId) {
    let getUser = await User.findByPk(id.userId);
    req.logIn(getUser, function (err) {
      if (err) {
        throw err;
      }
      res.render("Home", {
        User: getUser,
        getProductList,
        BanerList: getBanners,
      });
    });
  } else {
    res.render("Home", {
      User: req.user,
      BanerList: getBanners,
      getProductList,
    });
  }
});
app.get("/User/Login", (req, res) => {
  res.render("Login");
});
app.get("/User/Signup", (req, res) => {
  res.render("Signup");
});
app.get(
  "/Dash",
  connectEnsure.ensureLoggedIn({ redirectTo: "/User/Login" }),
  (req, res) => {
    res.render("AdminPanel", { title: "Dashboard" });
  }
);
app.get("/Dash/UserData", async (req, res) => {
  try {
    let userData = await User.getAllUser();
    res.render("UserData", { Users: userData });
  } catch (error) {
    console.log(`Error while fetching user Data:${error}`);
  }
});
app.get("/Dash/AddProduct", (req, res) => {
  res.render("ProductForm");
});
app.get("/User/Logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Signout Successfully");
    res.redirect("/User/Login");
  });
});

app.get(
  "/Dash/Product",
  connectEnsure.ensureLoggedIn({
    redirectTo: "/User/Login",
  }),
  async (req, res) => {
    // console.log(req.user.id);
    let getProductList = await Product.getProductList(String(req.user.id));
    console.log(getProductList);
    res.render("Products", { isAdmin: true, getProductList });
  }
);

app.get(
  "/Dash/Banner",
  connectEnsure.ensureLoggedIn({
    redirectTo: "/User/Login",
    failureMessage: "Please Login",
  }),
  async (req, res) => {
    let bannerList = await Banner.getBannersbyId(String(req.user.id));
    res.render("Banners", { Banner: bannerList });
  }
);

app.get("/SeeItem/:id", async (req, res) => {
  try {
    let getProductDetail = await Product.findByPk(req.params.id);
    let getCart = await Cart.getCartProduct(req.params.id);
    let isAdded = getCart ? true : false;

    res.render("ProductDetail", { Detail: getProductDetail, isAdded });
  } catch (error) {
    console.log(`Failed to SeeItem:${error}`);
  }
});

app.get(
  "/Cart",
  connectEnsure.ensureLoggedIn({ redirectTo: "/" }),
  async (req, res) => {
    try {
      let getCart = await Cart.getProducts(String(req.user.id));
      let itemsList = [];
      for (let i = 0; i < getCart.length; i++) {
        let item = await Product.findByPk(getCart[i].productId);
        itemsList.push(item);
      }
      // console.log(itemsList);
      res.render("Cart", { cart: itemsList, getCart });
    } catch (error) {
      console.log(`Failed To Open Cart:${error}`);
    }
  }
);

app.get(
  "/Customer/Add/:id",
  connectEnsure.ensureLoggedIn({ redirectTo: "/" }),
  async (req, res) => {
    try {
      let createCartItem = await Cart.create({
        productId: req.params.id,
        userId: req.user.id,
      });
      console.log(createCartItem);
      res.redirect("back");
    } catch (error) {
      console.log(`Failed to Create Cart:${error}`);
    }
  }
);

app.post(
  "/User/LoginData",
  passport.authenticate("local", {
    failureRedirect: "/User/Login",
    failureFlash: true,
  }),
  async (req, res) => {
    try {
      const userData = req.body;
      if (userData?.isRemember == "on") {
        res.cookie("userId", req.user.id);
      }
      console.log(req.user);
      res.redirect("/");
    } catch (error) {
      console.log(`Error In Posting User Data:${error}`);
      res.redirect("/");
    }
  }
);
app.post("/User/SignupData", async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    let isAlreadyUser = await User.getUser(email);
    console.log(isAlreadyUser);
    if (isAlreadyUser) {
      req.flash("error", "Account Already Exist");
      res.redirect("/User/Login");
    } else {
      if (password.length >= 8) {
        let isAdminUser = userName.includes("admin");
        let hashPass = await bcrypt.hash(password, 12);
        const createUser = await User.create({
          name: userName,
          email: email,
          password: hashPass,
          isAdmin: isAdminUser,
        });
        console.log(createUser);
        req.login(createUser, function (err) {
          if (err) {
            return next(err);
          }
          return res.redirect("/");
        });
      } else {
        req.flash("error", "Password Length Must Greatethan 8");
        res.redirect("/User/Signup");
      }
    }
  } catch (error) {
    console.log(`Error in Creating User : ${error}`);
    res.redirect("/");
  }
});

app.post(
  "/Admin/ProductData",
  connectEnsure.ensureLoggedIn({ redirectTo: "/User/Login" }),
  async (req, res) => {
    try {
      const {
        productName,
        description,
        buy_price,
        sell_price,
        qty,
        category,
        imgUrl,
      } = req.body;

      let createProduct = await Product.create({
        name: productName,
        description: description,
        Image_Url: imgUrl,
        sell_price: sell_price,
        buy_price: buy_price,
        Qty: qty,
        Type: category,
        userId: req.user.id,
      });
      console.log(createProduct);
      console.log("Created Successfully");
      req.flash("success", "Created Successfully");
      res.redirect("back");
    } catch (error) {
      console.log(`Error in Creating Product:${error}`);
    }
  }
);
app.post(
  "/Dash/AddBanner",
  connectEnsure.ensureLoggedIn({ redirectTo: "/User/Login" }),
  async (req, res) => {
    try {
      let { link } = req.body;
      let createBanner = await Banner.create({
        Img_Url: link,
        userId: req.user.id,
      });
      console.log(createBanner);
      req.flash("success", "Successfully Created");
      res.redirect("back");
    } catch (error) {
      console.log(`Error While Creating Banner:${error}`);
    }
  }
);
app.get("/Delete/Product/:id", async (req, res) => {
  try {
    let delteProduct = await Product.deleteProduct(req.params.id);
    req.flash("success", "Successfully Deleted");
    res.redirect("back");
  } catch (error) {
    console.log(`Error while Deleting Product:${error}`);
  }
});
app.get("/Delete/Banner/:id", async (req, res) => {
  try {
    let delteProduct = await Banner.deleteBanner(req.params.id);
    req.flash("success", "Successfully Deleted");
    res.redirect("back");
  } catch (error) {
    console.log(`Error while Deleting Product:${error}`);
  }
});
app.delete("/Remove/Cart/:id", async (req, res) => {
  try {
    let deleteItem = await Cart.deleteCartItem(req.params.id);
    console.log(
      "Receive Request Delete Product from Cart with id " +
        req.params.id +
        " Result " +
        deleteItem
    );
    return deleteItem ? true : false;
  } catch (error) {
    console.log(`Failed to Delete Product From Cart:${error}`);
  }
});

module.exports = app;
