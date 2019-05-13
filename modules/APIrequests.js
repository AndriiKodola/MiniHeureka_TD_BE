const axios = require('axios');

const localStorage = require('../modules/localStorage.js');

/*********************************************************************
*************************** CATEGORIES *******************************
*********************************************************************/

/**
* Gets extended data of categories from an API
* @return {array} - array of returned products by API
*/
const getExtendedCategories = () => {
  return getCategories()
    .then(categories => {
      extendCategories(categories);
    })
    .catch(hangleErrorWithLog);
};

/**
* Requests data of categories from an API
* @return {array} - array of returned by an API products
*/
const getCategories = () => {
  return axios.get(`http://python-servers-vtnovk529892.codeanyapp.com:5000/categories/`)
    .then(data => {
      return data.data;
    })
    .catch(hangleError);
};
/*
[
  {
    "categoryId": "",
    "title": ""
  }
]
----------------------needs image
*/

/**
* Extends data of each category in the given array
* @param {array} categories - array of basic category objects
* @return {array} - array of extended category objects
*/
const extendCategories = async categories => {
  for (let category of categories) {
    await addImage(category);
    await addProductCount(category);

    localStorage.insert('category', category);
  }
  return categories;
};

/**
* Extends basic category object with images
* @param {object} catedory - target category's object
* @return {array} - extended category's object
*/
const addImage = category => {
  return getExtendedProducts(category.categoryId, 0, 5)
    .then(products => {
      return findExpensiveImg(products);
    })
    .then(img => {
      category.img_url = img;
    });
};

/**
* Extends basic category object with images
* @param {object} catedory - target category's object
* @return {array} - extended category's object
*/
const addProductCount = category => {
  return getProductCount(category.categoryId)
    .then(productCount => {
      category.prodCount = productCount.count;
    });
};

/**
* Finds image of the most expensive product in the given array (probably most attractive)
* @param {array} products - an array of products
* @return {string} - url of a product image
*/
const findExpensiveImg = products => {
  const mostExpensiveProd = products
    .filter(product => product.img_url)
    .reduce(( acc, cur ) => {
      const higherPrice = Math.max( acc.maxPrice, cur.maxPrice );
      return acc.maxPrice === higherPrice ? acc : cur;
    }, 0);

  return mostExpensiveProd.img_url;
}

/*********************************************************************
**************************** PRODUCTS ********************************
*********************************************************************/

/**
* Gets extended data of products from an API
* @param {number} catedoryId - id of a target category
* @param {number} offset - offset, starting from 0
* @param {number} limit - products limit
* @return {array} - array of returned product objects
*/
const getExtendedProducts = (categoryId, offset, limit) => {
  return getProducts(categoryId, offset, limit)
    .then(extendProducts)
    .catch(hangleErrorWithLog);;
};

/**
* Requests data of products from an API for target category
* @param {number} catedoryId - id of a target category
* @param {number} offset - offset, starting from 0
* @param {number} limit - products limit
* @return {array} - array of returned product objects
*/
const getProducts = (categoryId, offset, limit) => {
  let url = `http://python-servers-vtnovk529892.codeanyapp.com:5000/products/${categoryId}`;
  if ((offset || offset === 0) && (limit || limit === 0)) {
    url += `/${offset}/${limit}`;
  }

  return axios.get(url)
    .then(data => {
      return data.data;
    })
    .catch(hangleError);
};
/*
[
  {
    "productId": "",
    "title": "",
    "categoryId": "image"
  }
]
----------------------needs image
----------------------needs description
----------------------needs price range
*/

/**
* Extends data of each product in the given array
* @param {array} products - array of basic product objects
* @return {object} - array of extended product objects
*/
const extendProducts = async products => {
  for (let product of products) {
    await extendProduct(product);
    await addOfferCount(product);

    localStorage.insert('product', product);
  }
  return products;
};

/**
* Extends data of a single product with image, description and price range
* @param {number} product - basic product object
* @return {object} - extended product object
*/
const extendProduct = product => {
  return getProductExtension(product)
    .then(data => {
      product.description = data.description;
      product.img_url = data.img_url;
      product.minPrice = data.minPrice;
      product.maxPrice = data.maxPrice;
    })
};

/**
* Extends data of a product with offers count
* @param {number} product - basic product object
* @return {object} - extended product object
*/
const addOfferCount = product => {
  return getOfferCount(product.productId)
    .then(offerCountObj => {
      product.offerCount = offerCountObj.count;
    });
};

/**
* Gets data needed fot basic product object extendion such as image, description and price range
* @param {number} product - basic product object
* @return {object} - extension data
*/
const getProductExtension = product => {
  return getOffers(product.productId, 0, 5)
    .then(offers => {
      const minPrice = offers.reduce(( acc, cur ) => Math.min( acc, cur.price ), Infinity);
      const maxPrice = offers.reduce(( acc, cur ) => Math.max( acc, cur.price ), 0);

      let description = '';
      let img_url = '';
      if (offers.find(offer => offer.description)) {
        description += offers.find(offer => offer.description).description;
      }
      if (offers.find(offer => offer.img_url)) {
        img_url += offers.find(offer => offer.img_url).img_url;
      }

      return { img_url, description, minPrice, maxPrice };
    })
    .catch(hangleErrorWithLog);
  
};

/**
* Requests count of products from an API for target category
* @param {number} catedoryId - id of a target category
* @return {object} - object with product count property
*/
const getProductCount = categoryId => {
  return axios.get(`http://python-servers-vtnovk529892.codeanyapp.com:5000/products/${categoryId}/count/`)
    .then(data => {
      return data.data;
    })
    .catch(hangleError);
};
/**
[
  {
    "count": ""
  }
]
*/

/*********************************************************************
***************************** OFFERS *********************************
*********************************************************************/

/**
* Requests data of offers from an API for target product
* @param {number} productId - id of a target product
* @param {number} offset - offset, starting from 0
* @param {number} limit - products limit
* @return {array} - array of returned products by API
*/
const getOffers = (productId, offset, limit) => {
  let url = `http://python-servers-vtnovk529892.codeanyapp.com:5000/offers/${productId}`;
  if ((offset || offset === 0) && (limit || limit === 0)) {
    url += `/${offset}/${limit}`;
  }

  return axios.get(url)
    .then(data => {
      const offers = data.data;

      offers.forEach(offer => localStorage.insert('offer', offer));

      return offers;
    })
    .catch(hangleError);
};
/*
{
  "description": "",
  "img_url": "",
  "offerId": ,
  "price": ,
  "productId": ,
  "title": "",
  "url": ""
}
*/

/**
* Requests count of offers from an API for target proudct
* @param {number} productId - id of a target product
* @return {object} - object with offer count property
*/
const getOfferCount = productId => {
  return axios.get(`http://python-servers-vtnovk529892.codeanyapp.com:5000/offers/${productId}/count/`)
    .then(data => {
      return data.data;
    })
    .catch(hangleError);
};
/**
[
  {
    "count": ""
  }
]
*/

/*********************************************************************
************************* ERROR HANDLING *****************************
*********************************************************************/

const hangleErrorWithLog = err => {
  console.log(`External server responded with status ${err.response.status} (${err.response.statusText}) during fetching data.`);
  return Promise.reject(err);
}

const hangleError = err => {
  return Promise.reject(err);
}

module.exports = {
  getExtCategories: getExtendedCategories,
  getCategories: getCategories,
  getExtendedProducts: getExtendedProducts,
  getProducts: getProducts,
  getProductCount: getProductCount,
  getOffers: getOffers,
  getOfferCount: getOfferCount
};

