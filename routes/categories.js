const express = require('express');
const router = express.Router();
const cors = require('cors');

const localStorage = require('../modules/localStorage.js');//module to interact with internal server's local storage
const APIrequests = require('../modules/APIrequests.js');//module to send and handling API requests

/** Categories GET route */
router.get('/', (req, res, next) => {
  if (localStorage.catExists()) {
    const categories = localStorage.getCat();
    res.json(categories);
  } else {
    APIrequests.getExtCategories()
      .then(categories => res.json(categories))
      .catch(err => {
        res.send(err.response.data);
      });
  }
});

/** Single category GET route */
router.get('/:categoryId/:page', cors(), (req, res, next) => {
  const { categoryId, page } = req.params;
  const category = localStorage.getCat(categoryId);
  const products = localStorage.getProd(categoryId);
  let firstNeededProdIdx = (page - 1) * 5;
  const productsPerPage = 5;
  const lastNeededProdIdx = firstNeededProdIdx + productsPerPage - 1;

  /** Sends request to the external server only in case requied products are missing in local storage */
  if (category.prodCount > products.length && lastNeededProdIdx > products.length - 1) {
    APIrequests.getExtendedProducts(categoryId, firstNeededProdIdx, productsPerPage)
      .then(productsForPage => {
        res.json(productsForPage);
        productsForPage.forEach(product => APIrequests.getOffers(product.productId));//requests data for use on the product detail page
      });

    firstNeededProdIdx += productsPerPage;
    APIrequests.getExtendedProducts(categoryId, firstNeededProdIdx, productsPerPage);//requests data for use on the next page
  } else {
    const productsForPage = products.slice(firstNeededProdIdx, lastNeededProdIdx + 1);
    res.json(productsForPage);

    productsForPage.forEach(product => APIrequests.getOffers(product.productId));//requests data for use on the product detail page
    firstNeededProdIdx += productsPerPage;
    APIrequests.getExtendedProducts(categoryId, firstNeededProdIdx, productsPerPage);//requests data for use on the next page
  }

  
});

module.exports = router;
