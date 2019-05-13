const express = require('express');
const router = express.Router();
const cors = require('cors');

const localStorage = require('../modules/localStorage.js');//module to interact with internal server's local storage
const APIrequests = require('../modules/APIrequests.js');//module to send and handling API requests

/** Single product GET route */
router.get('/:productId', cors(), (req, res, next) => {
  const productId = req.params.productId;
  const categories = localStorage.getCat();
  const product = localStorage.getSingleProd(productId);

  /** Looking for appropriate category for the product (to show in page's breadcrumb) */
  const prodAppropriateCat = categories.find(category => category.categoryId == product.categoryId);
  product.categoryTitle = prodAppropriateCat.title;

  /** Gathering together product data */
  const offers = localStorage.getOffers(productId);
  const data = [ product, offers ];

  /** For future use. Staging offer requests */
  if (product.offerCount === offers.length) {
    res.json(data);
  } else {
    const firstLackingOfferIdx = offers.length;
    const lackingOfferQuantity = product.offerCount - offers.length;
    APIrequests.getOffers(productId, firstLackingOfferIdx, lackingOfferQuantity)
      .then(newEntries => newEntries.forEach(offer => data[1].push(offer)))
      .then(data => res.json(data));
  }
});

module.exports = router;
