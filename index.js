const express = require('express');
const app = express();


const productsRoute = require('./routes/products');
const categoriesRoute = require('./routes/categories');



app.use(express.json());

// Use route files
app.use('/api/prodcuts', productsRoute);
app.use('/api/categories', categoriesRoute);



const PORT =  3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});