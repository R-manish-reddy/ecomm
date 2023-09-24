const express = require('express');
const app = express();
const path = require('path')
const bodyParser = require('body-parser')
const session = require('express-session');
app.set("view engine","ejs")

app.set("views",path.resolve("./views"))

const productsRoute = require('./routes/products');
const productsPostRoute = require('./routes/productsPost');
const categoriesRoute = require('./routes/categories');
const categoriesPostRoute = require('./routes/categoriesPost');
const imagesPostRoute = require('./routes/imagesPost');
const authRoute = require('./routes/userauth');



app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'your-secret-key', // Change this to a secure secret
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 3600000*8, // Set the session duration in milliseconds (1 hour in this example)
    },
  })
);



// Use route files

app.use('/api', authRoute);

app.use('/api/products', imagesPostRoute);

app.use('/api/products', productsRoute);
app.use('/api/products', productsPostRoute);



//categories routes
app.use('/api/categories', categoriesRoute);
app.use('/api/categories', categoriesPostRoute);





const PORT =  3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});