const express = require('express');
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.urlencoded( { extended: false }));
app.use(cors());

/** Requiring routes for categories and products */
const sectionRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');

app.use('/categories', sectionRoutes);
app.use('/product', productRoutes);

/** Routes */
app.get('/', (req, res) => {
  res.redirect('/categories');
});

/**
* Creating an error object and handing it off to the handler data the end of app and before error handler
*/
app.use((req, res, next) => {
  const err = new Error('Page not found');
  err.status = 404;
  next(err);
});

/**
* Error handler, renders an error template
*/
app.use((err, req, res, next) => {
  console.log(`An ${err.status} error occured`);
  res.locals.error = err;
  res.send(err);
});

/** Setting the server */
app.listen(port, () => {
  console.log(`Library manager app is running on localhost:${port}`);
});
