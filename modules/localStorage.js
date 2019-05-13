if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./local_storage');
}

/*********************************************************************
*********************** EXISTANSE CHECK FUNCTIONS ********************
*********************************************************************/

/**
* Checks data availability in local storage for categories
* @param {string} key
* @param {number} id - optional item id
* @return {boolean} - existanse of requested categories
*/
const categoryExistsInLS = id => {
  const keyExists = localStorage.getItem('categories') ? true : false;
  const idExists = id || id === 0 ? true : false;

  if (keyExists && idExists) {
    const existingEntryStr = localStorage.getItem('categories');
    const existingEntry = JSON.parse(existingEntryStr);
    const targetCategory = existingEntry.find(category => category.categoryId == id);
    return targetCategory ? true : false;
  }

  return keyExists;
}

/**
* Checks data availability in local storage for passed product object
* @param {object} product - product object
* @return {boolean} - existanse of requested products
*/
const productExistsInLS = product => {
  const key = `category_${product.categoryId}_products`;
  const keyExists = localStorage.getItem(key) ? true : false;

  if (keyExists) {
    const existingEntryStr = localStorage.getItem(key);
    const existingEntry = JSON.parse(existingEntryStr);
    const productExists = existingEntry.find(existingProduct => existingProduct.productId === product.productId) === undefined
      ? false
      : true;

    return productExists;
  }
  
  return keyExists;
}

/**
* Checks data availability in local storage for products
* @param {number} categoryId - id of the appropriate category
* @param {number} offset - starting index, begins from 0
* @param {number} limit - desired number of items
* @return {boolean} - existanse of requested products
*/
const productsExistInLS = (categoryId, offset, limit) => {
  const key = `category_${categoryId}_products`;
  const keyExists = localStorage.getItem(key) ? true : false;

  if (keyExists) {
    const existingEntryStr = localStorage.getItem(key);
    const existingEntry = JSON.parse(existingEntryStr);
    const lastNeededEntryId = offset + limit;

    if ( lastNeededEntryId < existingEntry.length ) {
      return true;
    } else {
      return false;
    }
  }

  return keyExists;
}

/**
* Checks data availability in local storage for passed offer object
* @param {object} offer - offer object
* @return {boolean} - existanse of requested products
*/
const offerExistsInLS = offer => {
  const key = `product_${offer.productId}_offers`;
  const keyExists = localStorage.getItem(key) ? true : false;

  if (keyExists) {
    const existingEntryStr = localStorage.getItem(key);
    const existingEntry = JSON.parse(existingEntryStr);
    const offerExists = existingEntry.find(existingOffer => existingOffer.offerId === offer.offerId) === undefined
      ? false
      : true;

    return offerExists;
  }

  return keyExists;
}

/**
* Checks data availability in local storage for offers
* @param {number} productId - id of the appropriate product
* @param {number} offset - starting index, begins from 0
* @param {number} limit - desired number of items
* @return {boolean} - existanse of requested offers
*/
const offersExistInLS = (productId, offset, limit) => {
  const key = `product_${productId}_offers`;
  const keyExists = localStorage.getItem(key) ? true : false;

  if (keyExists) {
    const existingEntryStr = localStorage.getItem(key);
    const existingEntry = JSON.parse(existingEntryStr);
    const lastNeededEntryId = offset + limit;

    if ( lastNeededEntryId < existingEntry.length ) {
      return true;
    } else {
      return false;
    }
  }
  
  return keyExists;
}

/**********************************************************************
************************ INSERTION FUNCTIONS **************************
**********************************************************************/

/** Inserts entries to local storage
* @param {string} entryType - entry type to insert into local storage (possible vaules: category, product, offer)
* @param {array} newEntry - new entry to insert in local storage
*/
const insertIntoLS = (entryType, newEntry) => {
  let key = '';
  let keyExists = false;
  let itemExists = false;

  if (entryType === 'category') {
    key = 'categories';
    keyExists = localStorage.getItem(key) ? true : false;
    itemExists = categoryExistsInLS(newEntry.categoryId);
  } else if (entryType === 'product') {
    key = `category_${newEntry.categoryId}_products`;
    keyExists = localStorage.getItem(key) ? true : false;
    itemExists = productExistsInLS(newEntry);
  } else if (entryType === 'offer') {
    key = `product_${newEntry.productId}_offers`;
    keyExists = localStorage.getItem(key) ? true : false;
    itemExists = offerExistsInLS(newEntry);
  }
  
  if (!keyExists) {
    createInLS(key, Array.isArray(newEntry) ? newEntry : [newEntry]);
  } else if (!itemExists) {
    addToLS(key, Array.isArray(newEntry) ? newEntry : [newEntry]);
  }
};

/** Creates new key into local storage and adds data
* @param {string} key - target key in local storage
* @param {array} newEntry - new entry to insert in local storage
*/
const createInLS = (key, newEntry) => {
  const newEntryStr = JSON.stringify(newEntry);
  localStorage.setItem(key, newEntryStr);
};

/** Adds entries to existing local storage key
* @param {string} key - target key in local storage
* @param {array} newEntry - new entry to insert in local storage
*/
const addToLS = (key, newEntry) => {
  const existingEntryStr = localStorage.getItem(key);
  const resultEntry = JSON.parse(existingEntryStr);

  newEntry.forEach(entryItem => {
    const entryItemStr = JSON.stringify(entryItem);
    if (!existingEntryStr.includes(entryItemStr)) {
      resultEntry.push(entryItem);
    }
  });

  localStorage.removeItem(key);
  localStorage.setItem(key, JSON.stringify(resultEntry));
};

/**********************************************************************
************************ EXTRACTION FUNCTIONS *************************
**********************************************************************/

/** Get categories from local storage
* @param {number} id - optional category id
* @return {array} - array of all entries for categories
*/
const getCategories = id => {
  const existingEntryStr = localStorage.getItem('categories');
  const categories = JSON.parse(existingEntryStr);
  const idExists = id || id === 0 ? true : false;

  if (idExists) {
    return categories.find(category => category.categoryId == id);
  }

  return JSON.parse(existingEntryStr);
};

/** Get products from local storage
* @param {number} categoryId - target category id
* @param {number} offset - starting index, begins from 0
* @param {number} limit - desired number of items
* @return {array} - array of all entries for categories
*/
const getProducts = (categoryId, offset, limit) => {
  const key = `category_${categoryId}_products`;
  const existingEntryStr = localStorage.getItem(key);
  const existingEntry = JSON.parse(existingEntryStr);
  let firstNeededEntryId = 0;
  let lastNeededEntryId = existingEntry.length;
  let resultEntry = [];

  if (offset !== undefined && limit !== undefined) {
    firstNeededEntryId = offset;
    lastNeededEntryId = offset + limit;
  }

  for (let i = firstNeededEntryId; i < lastNeededEntryId; i++) {
    resultEntry.push(existingEntry[i]);
  }

  return resultEntry;
};

/** Get single product from local storage
* @param {number} targetProductId - id of a target product
* @return {object} - extended product object
*/
const getProduct = targetProductId => {
  const categories = JSON.parse(localStorage.getItem('categories'));
  const allProducts = [];
  categories.forEach(category => {
    const currCategoryProducts = JSON.parse(localStorage.getItem(`category_${category.categoryId}_products`));
    currCategoryProducts.forEach(product => allProducts.push(product));
  });
  const targetProduct = allProducts.find(product => product.productId == targetProductId);
  return targetProduct;
};

/** Get offers from local storage for target product
* @param {number} productId - target product id
* @return {array} - array of all offers
*/
const getOffers = productId => {
  const key = `product_${productId}_offers`;
  const offers = JSON.parse(localStorage.getItem(key));

  return offers;
};

/**
* Delete key from local storage
* @param {string} key
*/
const deleteKeyFromLS = key => {
  localStorage.removeItem(key);
};

module.exports = {
  catExists: categoryExistsInLS,
  prodExists: productExistsInLS,
  productsExist: productsExistInLS,
  offerExists: offerExistsInLS,
  offersExist: offersExistInLS,
  insert: insertIntoLS,
  getCat: getCategories,
  getProd: getProducts,
  getSingleProd: getProduct,
  getOffers: getOffers,
  removeKey: deleteKeyFromLS
};
