/**
 *  jobs for monq background job queue
 */
var fs = require('fs'),
    _ = require('lodash'),
    zlib = require('zlib'),
    path = require('path'),
    async = require('async'),
    exec = require("child_process").exec,
    utilities = require('../utils'),
    Brand = require('../models/Brand'),
    Product = require('../models/Product'),
    Category = require('../models/Category'),
    ProductAttribute = require('../models/ProductAttribute'),
    Converter = require('csvtojson').core.Converter,
    config = require('config'),
    sendgrid = require('sendgrid')(config.sendgrid.username, config.sendgrid.password);

function toTitleCase(str) {
    if (str) return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    return str;

}
module.exports = function(app) {

    var jobs = {};

    jobs.upload = function(params, callback) {
        //console.log("inside the upload..");
        exec("mkdir tmp");
        //exec("mkdir ../tmp/csv_uploads");
        console.log('params', params)
        var upload = false // determines if the csv file is already uploaded or not
            ,
            BRAND_SEARCH = false // initially there is no brand
            ,
            BRAND_ID = params.brandId,
            filePath = params.filePath,
            brandName = params.brandName,
            csvConverter = new Converter(),
            csvdata = '',
            uploadType = params.uploadType;
        // console.log("uploadType", uploadType)
        if (params.brandId) BRAND_SEARCH = true;
        //console.log("-----------");
        // console.log("-----------");
        //end_parsed will be emitted once parsing finished
        csvConverter.on('end_parsed', function(jsonObj) {
            exec("rm -rf " + filePath);
            var fulluploadArray = {};
            var products = jsonObj.csvRows;
            var actualProductsCount = products.length;
            console.log('@@ product length@@@@',actualProductsCount);
            // products = _.filter(products, function(product) {
            //         return product.has_image && product.has_image.toLowerCase() != 'draft' && product.sectors && product.sectors.trim() && product.categories && product.categories.trim();
            //     })
                // products = _.map(products , function(product) {
                //   products.categories = toTitleCase(products.categories);
                //   if (product["attribute:pa_Semi vs Complete"] && product["attribute:pa_Semi vs Complete"].trim()) {
                //     product["attribute:pa_Semi vs Complete"] = toTitleCase(product["attribute:pa_Semi vs Complete"]);
                //   }
                //   if (product["attribute:pa_Type"] && product["attribute:pa_Type"].trim()) {
                //     product["attribute:pa_Type"] = toTitleCase(product["attribute:pa_Type"]);
                //   }
                //   if (product["attribute:pa_Gender"] && product["attribute:pa_Gender"].trim()) {
                //     product["attribute:pa_Gender"] = toTitleCase(product["attribute:pa_Gender"]);
                //   }
                //   _.each(product,function(value,key) {
                //      if(key && key.trim().indexOf('settings:') == 0){
                //         if(product[key] && product[key].trim()) {
                //            if(product[key].trim().toLowerCase() == 'yes') product[key] = 'true';
                //            if(product[key].trim().toLowerCase() == 'no') product[key] = 'false';
                //         }
                //      }
                //   })
                //   return product;
                // })
            var updatedProductCount = 0;
            var noOfNewProducts = 0;
            var noOfupdatedProducts = 0;
            var noOfNotUploadproducts = 0;

            function uploader(i) {

                if (i < products.length) {
                    var  product = products[i];
                    var counter = i;
                    // console.log('product',product);
                    if (product && product.has_image && product.has_image.toLowerCase() != 'draft' && product.sectors && product.sectors.trim() && product.categories && product.categories.trim() ) {
                        // console.log(product);
                        console.log("######################################################################################################");
                        // console.log("######################################################################################################");
                        // console.log("######################################################################################################");
                        console.log('count = ' + i);
                        console.log("######################################################################################################");
                        // console.log("######################################################################################################");
                        // console.log("######################################################################################################");

                            var brandId = BRAND_ID,
                            brand, sectors, optId;
                        products.categories = toTitleCase(products.categories);
                        if (product["attribute:pa_Semi vs Complete"] && product["attribute:pa_Semi vs Complete"].trim()) {
                            product["attribute:pa_Semi vs Complete"] = toTitleCase(product["attribute:pa_Semi vs Complete"]);
                        }
                        if (product["attribute:pa_Type"] && product["attribute:pa_Type"].trim()) {
                            product["attribute:pa_Type"] = toTitleCase(product["attribute:pa_Type"]);
                        }
                        if (product["attribute:pa_Gender"] && product["attribute:pa_Gender"].trim()) {
                            product["attribute:pa_Gender"] = toTitleCase(product["attribute:pa_Gender"]);
                        }
                        _.each(product, function(value, key) {
                                if (key && key.trim().indexOf('settings:') == 0) {
                                    if (product[key] && product[key].trim()) {
                                        if (product[key].trim().toLowerCase() == 'yes') product[key] = 'true';
                                        if (product[key].trim().toLowerCase() == 'no') product[key] = 'false';
                                    }
                                }
                            })
                            /**
                             * Two things, it could either be Brand Search or Cross Brand Search
                             * 1. Brand Search
                             *    The BRAND_SEARCH varable would be 'true'
                             *    if brandId is coming that means the brand's id is validated on the web server i.e. hw ref: uploadscontroller
                             *    the brandName would be product['meta:brand_name']
                             *
                             * 2. Cross Brand Search
                             *    In this case, the BRAND_SEARCH is going to be false and we are going to find or create a new Brand each time
                             */
                        async.series([
                            function(cb) {
                                // if (!BRAND_SEARCH) brandName = product['meta:brand_name'];

                                if (!BRAND_SEARCH) {
                                    optId = product['brandId'];
                                    brandName = product['brandName'];

                                }
                                var brandQuery = {
                                    name: brandName
                                };

                                // sectors would be csv
                                sectors = product.sectors ? product.sectors.split(',') : [];
                                // use optId instead of brandName brand has optId and product in company.optId
                                // full upload


                                Brand.findOne(brandQuery, function(err, br) {
                                    if (!err && br) {
                                        var updatedSectors = _.uniq(br.sectors, function(id) {
                                            return id.toString();
                                        });

                                        br.sectors = updatedSectors.concat(sectors);
                                        br.sectors = _.uniq(br.sectors, function(id) {
                                            return id.toString();
                                        });
                                        // console.log("Found the brand .... " + brandName);
                                        brand = br;
                                        brandId = br.id;
                                        if (!br.optId) {
                                            br.optId = product['brandId'];
                                        }
                                        br.save(function(err, brandobject) {
                                            if (err) console.error(err);
                                            cb(null);
                                        })

                                    } else if (!err && !br) {
                                        //console.log("NOT Found the brand .... " + brandName);
                                        var dotSplit = (brandName.toLowerCase()).split('.');

                                        // brandQuery.slug = (brandName.toLowerCase()).split(' ').join('-');
                                        brandQuery.slug =
                                            (dotSplit.length > 1) ?
                                            (brandName.toLowerCase()).split('.').join('-').split(' ').join('') :
                                            (brandName.toLowerCase()).split(' ').join('-');

                                        brandQuery.name = brandName; // should add name to brand
                                        brandQuery.sectors = sectors; // should add sectors to brand

                                        Brand.create(brandQuery, function(err, br) {
                                            if (err) {
                                                //  console.log("there was an error creating the brand with name " + brandName);
                                                console.error(err);
                                                counter++;
                                                uploader(counter);
                                            }
                                            if (br && !err) {
                                                brand = br;
                                                brandId = br.id;
                                                cb(null);
                                            }
                                        });
                                    }
                                });

                            },
                            function(cb) {

                                // do we need this ? - kt
                                if (!upload) {
                                    var tmpfile = path.resolve(__dirname, '../../tmp/' + brand.name + '_latest.csv');
                                    // console.log("@@@@@@tmpfile"+tmpfile)
                                    fs.writeFileSync(tmpfile, csvdata); // make this async
                                    upload = true;
                                }

                                var rules = brand.rules ? brand.rules : app.config.brand.rules,
                                    sku = product['sku'];
                                //, currentProduct = new Product();

                                Product.findOne({
                                    sku: sku
                                }, function(err, currentProduct) {
                                    if (err) {

                                        console.log("inside error while finding the product");
                                        console.error(err);
                                        console.error('proudct ' + counter + ' not uploaded');
                                        counter++;
                                        uploader(counter);
                                    } else {
                                        if (!currentProduct) {
                                            //console.log("No product found ----");
                                            noOfNewProducts++;
                                            var currentProduct = new Product();
                                        } else {
                                            noOfupdatedProducts++;
                                            //console.log("product found.........");
                                            currentProduct.updatedAt = new Date();
                                        }
                                        /////////////////////////////////////////////////////////////////
                                        if (uploadType == 'full') {
                                            if (!fulluploadArray[brandId]) {
                                                if (product['sku']) fulluploadArray[brandId] = [product['sku']];
                                            } else {
                                                if (product['sku']) fulluploadArray[brandId].push(product['sku']);

                                            }
                                            if (i == (products.length - 1)) {
                                                //console.log('@@@@@@@@ Going to this condition @@@@@@@@@@@@');
                                                fullUploadAction(fulluploadArray);
                                            }
                                            //console.log('@@@@@@@@@@ fulluploadArray @@@@@@@@@@@@@');
                                            //  console.log(fulluploadArray);
                                        }
                                        /////////////////////////////////////////////////////////////////
                                        uploadCurrentProduct(rules, currentProduct, product, brand, brandId, sectors, function(err, currentProduct) {
                                            if (err) {
                                                console.log("inside error of callback");

                                                console.error("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
                                                console.error("Product " + product.brandName + "(sku:" + product.sku + ") not uploaded due to:\n");
                                                console.error(err);
                                                console.error("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
                                                counter++;
                                                uploader(counter);
                                            } else if (currentProduct) {

                                                counter++;
                                                uploader(counter);
                                            }
                                        });
                                    }



                                });


                            }

                        ]);

                    } else {
                        noOfNotUploadproducts++;
                        counter++;
                        uploader(counter);
                    }

                } else {

                    console.log('@@@@@@@@@@ @@@@@@@@@@@')
                    console.log('@@@@@@@ done uploads @@@@@@@');
                    console.log('@@@@@@@@@@ @@@@@@@@@@@')
                    noOfupdatedProducts = actualProductsCount - noOfNotUploadproducts;
                    /////////////////////////////

                    sendUploadCompletionEmail(params, actualProductsCount, noOfNewProducts, noOfupdatedProducts, noOfNotUploadproducts);
                    /////////////////////////////////
                    callback(null, 'Success')
                }
            };

            uploader(0);

        });

        /**
         * Use the nodejs's fs module to create a readStream and read the data in pipes i.e. broken and structured data
         * This data is then passed to the csvConverter which calls the event 'end_parsed'
         */
        // console.log(__dirname+filePath);
        var rstream = fs.createReadStream(filePath),
            writePath = path.resolve(__dirname, '../../tmp/' + params.fileName) // target to upload to s3 bucket
            ,
            wstream = fs.createWriteStream(writePath);

        // upload file
        rstream.pipe(wstream);

        //console.log("The file has been uploaded at this path = ", writePath);

        // read from file
        rstream
            .on('data', function(chunk) {
                csvdata += chunk;
            })
            .on('end', function() {
                exec("rm -rf " + filePath);
                csvConverter.from(csvdata);
            });

    };

    return jobs;
};

var uploadCurrentProduct = function(rules, currentProduct, product, brand, brandId, sectors, cb) {
    currentProduct.brand = brandId;
    uploaderLogic(rules, currentProduct, product, brand, sectors, function(uploadedProduct) {
        if (uploadedProduct) {
            uploadedProduct.save(function(err, product) {
                if (err) {
                    console.log("inside error line 110");
                    console.error(err);
                    return cb(err);
                    // uploader(counter);
                    // return callback(err);
                }
                if (product) return cb(null, uploadedProduct);
            });
        } else {
            console.error('there is no currentProduct, now what ?');
            return cb("error");
        }
    });
};

/**
 * All the main logic goes here
 * We use async, category models and more
 * you have different variables here
 *
 *   Rules - the rules set by brand (or default)
 *   allKeys - all the keys from the rules Object
 *   currentProduct - is the new product or say instance of Product model
 *   product - is the csv parsed Object carrying product information
 *
 * 1. collect all the keys of the rules set by a brand
 * 2. create an async series with parentCallback (thats cos there are two async series used here)
 * 3. create a recursive function name 'ruleKeys', it loops through the keys in the rules.(allKeys)
        note - a simple for (i in Obj) caused a few issues mainly with categories, cos that is totally
               asynchronous. For loops and asynchronous functions were a pain, thus a recursive approach

 * 4. switch between rule and apply the right logic
 * 5. if no special case, then simple apply rule which is in the default section
 */

var uploaderLogic = function uploaderLogic(rules, currentProduct, product, brand, sectors, cb) {

    currentProduct.opt = {};
    currentProduct.company = {};
    currentProduct.inventory = {};
    currentProduct.attributes = {};

    var brandId = currentProduct.brand;

    // 1.
    var allKeys = utilities.collectKeys(rules, []);
    // 2.
    async.series([
        function(parentCallback) {

            // 3.
            function ruleKeys(keyCount) {
                if (keyCount < allKeys.length) {

                    var rule = allKeys[keyCount];

                    // 4.
                    switch (rule) {

                        case 'images':
                            currentProduct[rule] = product[rules[rule]].split('|');
                            break;

                        case 'quantity':
                        case 'stockStatus':
                            currentProduct.inventory[rule] = product[rules[rule]];
                            break;

                        case 'optName':
                            currentProduct.company[rule] = product[rules[rule]];
                            currentProduct.company.slug = product[rules[rule]];
                            break;

                        case 'optId':
                            brand.optId = product[rules[rule]];
                            currentProduct.company[rule] = product[rules[rule]];
                            break;

                        case 'optStyleName':
                            currentProduct.opt.styleName = product[rules[rule]];
                            break;

                        case 'optStyleNumber':
                            currentProduct.opt.styleNumber = product[rules[rule]];
                            break;

                        case 'optReferenceNumber':
                            currentProduct.opt.referenceNumber = product[rules[rule]];
                            break;

                        case 'list':
                        case 'retail':
                        case 'savings':
                        case 'endRange':
                        case 'wholesale':
                        case 'startRange':
                            currentProduct.pricing[rule] = product[rules[rule]];
                            break;

                        case 'weight':
                            currentProduct.shipping[rule] = product[rules[rule]];
                            break;

                        case 'dimensions_width':
                        case 'dimensions_length':
                        case 'dimensions_height':
                            // product.shipping.dimenstions.width
                            // product.shipping.dimenstions.length
                            // product.shipping.dimenstions.height
                            currentProduct.shipping.dimensions[rule.split('_')[1]] = product[rules[rule]];
                            break;

                        case 'seo_h1tag':
                        case 'seo_title':
                        case 'seo_seoUrl':
                        case 'seo_pageDesc':
                        case 'seo_metaDescription':
                            // product.seo.h1tag
                            // product.seo.title
                            currentProduct.seo[rule.split('_')[1]] = product[rules[rule]];
                            break;

                        case 'seo_keywords':
                            currentProduct.seo.keywords = product['seo_keywords'].split(',');
                            break;

                        case 'sectors':
                            currentProduct.sectors = sectors;
                            break;

                        case 'settings':
                            var productKeys = utilities.collectKeys(product, []),
                                allSettingsKeys = {};

                            for (var i = 0, len = productKeys.length; i < len; i++) {
                                var key = productKeys[i],
                                    splitKey = key.split(':');

                                if (splitKey[0] == 'settings') {
                                    var attrName = splitKey[1];

                                    if (!_.isEmpty(product[key])) {
                                        allSettingsKeys[attrName] = product[key];
                                    }
                                }
                            }

                            currentProduct.settings = allSettingsKeys;

                            break;


                            /**
                             * TODO:
                             * avoid for loop for productKeys here
                             * Get that for looping done outside of this recursive function and
                             * utilise it here as metaHeaders
                             *
                             * for example -
                             *   meta:brand_name
                             *   meta:Ring Size
                             */
                        case 'meta':
                            var productKeys = utilities.collectKeys(product, []),
                                allMetaKeys = {},
                                metaVal = {};

                            for (var i = 0, len = productKeys.length; i < len; i++) {
                                var key = productKeys[i],
                                    splitKey = key.split(':');

                                if (splitKey[0] == 'meta') {
                                    var attrName = splitKey[1];

                                    if (!_.isEmpty(product[key])) {
                                        var attrVals = product[key].split('|');
                                        var newAttrVals = [];
                                        if (attrName.indexOf('pg_options') === 0) {
                                            attrVals.forEach(function(val) {
                                                val = 'brand_' + val;
                                                //Replace all dots in the name.
                                                val = val.replace(/\./g, '');
                                                newAttrVals.push(val);
                                            });
                                            attrVals = newAttrVals;
                                        }
                                        allMetaKeys[attrName] = attrVals;
                                    }
                                }
                            }

                            currentProduct.meta = allMetaKeys;

                            break;

                            /**
                             * TODO:
                             * avoid for loop for productKeys here
                             * Get that for looping done outside of this recursive function and
                             * utilise it here as attrHeaders
                             */
                        case 'attributes':
                            /**
                             * store attributes in a JS object with the ones in a special naming convention as
                             *   attribute:pa_<property>
                             *
                             * Do not store attribute:<property>.
                             */
                            var productKeys = utilities.collectKeys(product, []),
                                allAttrsKeys = [],
                                allAttrs = {};

                            for (var i = 0, len = productKeys.length; i < len; i++) {
                                var key = productKeys[i],
                                    splitKey = key.split('_');

                                if (splitKey[0] == 'attribute:pa') {

                                    /* attribute name should exclude 'attribute:pa'
                                    if (splitKey[1] === 'HW')
                                      splitKey.splice(0,2);
                                    else
                                      splitKey.splice(0,1);
                                    */

                                    splitKey.splice(0, 1);
                                    var attrName = splitKey.join('_');
                                    //Replace all dots in the name.
                                    attrName = attrName.replace(/\./g, '');
                                    allAttrsKeys.push(attrName);
                                    allAttrs[attrName] = product[key];
                                    if (!_.isEmpty(product[key]))
                                        currentProduct.attributes[attrName] = product[key].split('|');
                                }

                                //Handle post_content by stripping HTML tags and storing each attributes as
                                //brand attributes
                                if (key == 'post_content') {
                                    //console.log('post_content');

                                    if (product[key]) {
                                        var out = product[key].replace(/<\/li>/g, "DIFF;");
                                        out = out.replace(/<\/?[^>]+(>|$)/g, "");
                                        //console.log(out);

                                        var pcArray = out.split("DIFF;");
                                        for (var j = 0; j < pcArray.length; j++) {
                                            //console.log(pcArray[j]);
                                            var splitKey = pcArray[j].split(':');
                                            var attrName = 'brand_' + splitKey[0].trim();
                                            if (splitKey[1]) {
                                                var attrValue = splitKey[1].trim();
                                                //Replace all dots in the name.
                                                attrName = attrName.replace(/\./g, '');
                                                // console.log(attrName + ' ---- '+ attrValue);
                                                allAttrsKeys.push(attrName);
                                                allAttrs[attrName] = attrValue;
                                                if (!_.isEmpty(attrValue)) {
                                                    currentProduct.attributes[attrName] = attrValue.split('|');
                                                }
                                            }

                                        }
                                    }

                                }
                            }


                            // var allAttrs = currentProduct.attributes;

                            // iterate through all the keys of attributes and create a new ProductAttribute if needed.
                            var count = 0;

                            function uploadAllAttrsKeys(count) {

                                if (count < allAttrsKeys.length) {
                                    async.series([
                                        function(callback) {

                                            var attrName = allAttrsKeys[count].trim(),
                                                attrVal = allAttrs[allAttrsKeys[count]] ? allAttrs[allAttrsKeys[count]].trim() : '';

                                            var query = {
                                                name: attrName
                                            };

                                            ProductAttribute.findOne(query, function(err, attr) {
                                                if (!err && !attr) {

                                                    // prepare the productAttribute object
                                                    query.slug = (attrName.toLowerCase()).split(' ').join('-');
                                                    query.brands = [];
                                                    query.values = [];
                                                    query.categories = [];
                                                    query.sectors = sectors;
                                                    query.brands.push(brandId);
                                                    if (!query.displayName) query.displayName = query.name;
                                                    if (!_.isEmpty(attrVal)) {
                                                        if (typeof attrVal !== 'string') return;
                                                        var splitString = attrVal.split('|');
                                                        if (splitString.length < 1) return;
                                                        splitString.forEach(function(item) {
                                                            query.values.push(item.trim());
                                                        });
                                                    }

                                                    var attr = new ProductAttribute(query);

                                                    collectCategoriesForAttributesAndSave(attr, product, rules);
                                                    count++;
                                                    uploadAllAttrsKeys(count);

                                                } else if (attr) {

                                                    var brands = attr.brands;
                                                    var vals = attr.values;
                                                    var attrSectors = attr.sectors;
                                                    brands.push(brandId);
                                                    if (!_.isEmpty(attrVal)) {
                                                        if (typeof attrVal !== 'string') return;
                                                        var splitString = attrVal.split('|');
                                                        if (splitString.length < 1) return;
                                                        splitString.forEach(function(item) {
                                                            vals.push(item.trim());
                                                        });
                                                    }

                                                    var updatedBrands = _.uniq(brands, function(id) {
                                                        return id.toString();
                                                    });

                                                    attr.sectors = attrSectors.concat(sectors);
                                                    attr.sectors = _.uniq(attr.sectors, function(id) {
                                                        return id.toString();
                                                    });
                                                    var updatedVals = _.uniq(vals);

                                                    attr.brands = updatedBrands;
                                                    attr.values = updatedVals;
                                                    attr.slug = (attrName.toLowerCase()).split(' ').join('-');
                                                    if (!attr.displayName) attr.displayName = attr.name;
                                                    collectCategoriesForAttributesAndSave(attr, product, rules);
                                                    count++;
                                                    uploadAllAttrsKeys(count);

                                                }
                                            });
                                        },

                                        function(callback) {
                                            parentCallback(null, 'two');
                                        }
                                    ]);
                                }
                            }

                            uploadAllAttrsKeys(0);
                            break;

                        case 'status':
                            // OLD - visible to Active, hidden to Inactive, search to search
                            // NEW - data would have direct values, so no mapping. - kt
                            /*var status = {
                              visible: 'Active',
                              hidden: 'Inactive',
                              search: 'Search'
                            }*/

                            currentProduct.status = product[rules[rule]];
                            break;

                        case 'categories':
                            /**
                             * a. is a pipe separated data to be parsed.
                             * b. find the category by name, capture the id and store it for the product.categories.
                             * c. if the id does not exist, create a new category, store it and then goto b
                             *
                             * uses async again or else the ids would not be saved
                             */

                            // a.
                            collectCategories({
                                currentProduct: currentProduct,
                                product: product,
                                rules: rules,
                                rule: rule,
                                brand: brand,
                                sectors: sectors
                            }, parentCallback);

                            break;

                            // 5.
                        default:
                            currentProduct[rule] = product[rules[rule]];
                            break;
                    }

                    keyCount++;
                    ruleKeys(keyCount); // recursive
                }

            }


            ruleKeys(0);

        },
        function(parentCallback) {

            addAssociatedProducts({
                currentProduct: currentProduct,
                product: product,
                rules: rules,
                rule: 'associatedProducts', //static demarkation for associatedProducts
                brand: brand
            }, function(currentProduct) {

                addMatchingProducts({
                    currentProduct: currentProduct,
                    product: product,
                    rules: rules,
                    brand: brand
                }, function(currentProduct) {
                    console.log("Now returning a callback");
                    cb(currentProduct);
                });

            });

        }
    ]);



};


function collectCategories(params, parentCallback) {

    var currentProduct = params.currentProduct,
        product = params.product,
        rules = params.rules,
        rule = params.rule,
        brand = params.brand,
        sectors = params.sectors;

    var categories = product[rules[rule]] ? product[rules[rule]].split('|') : [],
        count = 0,
        cgIds = [],
        categoryIds = [];

    async.series([
        function(callback) {

            function uploadCategories(count) {

                if (count < categories.length) {
                    var query = {
                        name: categories[count]
                    };

                    // b.
                    Category.findOne(query, function(err, category) {

                        if (category) {
                            brand.categories.push(category.id);

                            var index = _.findIndex(category.brands, function(id) {
                                return id.toString() == brand.id;
                            });

                            if (index < 0) category.brands.push(brand.id);
                            category.sectors = category.sectors.concat(sectors);
                            category.sectors = _.uniq(category.sectors, function(id) {
                                return id.toString();
                            });
                            if (!category.displayName) category.displayName = category.name;
                            // category.sectors = sectors;
                            category.save();
                            categoryIds.push(category.id);
                            count++;
                            uploadCategories(count);

                        } else if (!category) {

                            // c.
                            query.slug = (categories[count].toLowerCase()).split(' ').join('-');
                            query.brands = [];
                            query.sectors = sectors;
                            query.brands.push(brand.id);
                            if (!query.displayName) query.displayName = query.name;
                            Category.create(query, function(err, cg) {
                                if (!err && cg) {
                                    brand.categories.push(cg.id);
                                    categoryIds.push(cg.id);
                                    count++;
                                    uploadCategories(count);
                                }
                            });
                        }

                    });

                } else {
                    currentProduct.categories = categoryIds;
                    callback(null, 'two');
                }

            }

            uploadCategories(0);

        },
        function(callback) {

            brand.categories = _.uniq(brand.categories, function(id) {
                return id.toString();
            });
            brand.save();

            parentCallback(null, 'two');
        }
    ]);

}

function collectCategoriesForAttributesAndSave(attr, product, rules) {

    var categoryRule = rules['name'],
        categories = product[categoryRule] ? product[categoryRule].split('|') : [],
        count = 0,
        cgIds = [];

    async.series([
        function(callback) {

            function uploadCategory(count) {

                if (count < categories.length) {

                    var query = {
                        name: categories[count].trim()
                    };

                    // b.
                    Category.findOne(query, function(err, category) {

                        if (category) {
                            cgIds.push(category.id);
                            count++;
                            uploadCategory(count);

                        } else if (!category) {

                            // c.
                            query.brands = [];
                            query.brands.push(brand.id);
                            Category.create(query, function(err, cg) {
                                if (!err && cg) {
                                    cgIds.push(cg.id);
                                    count++;
                                    uploadCategory(count);
                                }
                            });
                        }

                    });

                } else {
                    callback(null, 'two');
                }

            }

            uploadCategory(0);

        },
        function(callback) {
            attr.categories = _.uniq(cgIds, function(id) {
                return id.toString();
            });
            attr.save();
        }
    ]);

}

/**
 * parse all the relatedProducts along with associatedProducts
   1. in the column associatedProducts, we will have a bunch of comma-separated sku-ids.
   2. loop through each of them and check if a product exist by sku-id,
      if it does then we will add them to the product if not then we will have to create them
 */

function addAssociatedProducts(params, cb) {

    var currentProduct = params.currentProduct,
        product = params.product,
        rules = params.rules,
        brand = params.brand;

    var associatedProducts = product.associatedProducts ? product.associatedProducts.split(',') : [],
        len = associatedProducts.length,
        count = 0;

    function recursiveAssociated(count) {
        if (count < len) {

            var sku = associatedProducts[count];

            Product.findOne({
                title: sku
            }, function(err, prd) {
                if (!err && prd) currentProduct.associatedProducts.push(prd.id);
                count++;
                recursiveAssociated(count);
            });

        } else {
            cb(currentProduct);
        }

    }

    recursiveAssociated(0);
};

function addMatchingProducts(params, cb) {

    var currentProduct = params.currentProduct,
        product = params.product,
        rules = params.rules,
        brand = params.brand;

    var matchingProducts = product.matchingProducts ? product.matchingProducts.split(',') : [],
        len = matchingProducts.length,
        count = 0;

    function recursiveAssociated(count) {
        if (count < len) {

            var sku = matchingProducts[count];

            Product.findOne({
                title: sku
            }, function(err, prd) {
                if (!err && prd) currentProduct.matchingProducts.push(prd.id);
                count++;
                recursiveAssociated(count);
            });

        } else {
            cb(currentProduct);
        }

    }

    recursiveAssociated(0);
};

function fullUploadAction(fulluploadProducts) {
    //fulluploadProducts = {brandName:['productsku']}
    var productArray = [];
    _.each(fulluploadProducts, function(productSkus, brandId) {
        // console.log('productSkus', productSkus);
        // console.log('BrandId', brandId);
        if (productSkus.length > 0) productArray = productArray.concat(productSkus);

    });

    Product.update({
        sku: {
            $nin: productArray
        }
    }, {
        $set: {
            status: 'Inactive'
        }
    }, {
        multi: true
    }, function(err, productUpdateStatus) {
        if (err) console.error(err);
        else if (productUpdateStatus) {
            console.log('All product set Inactive Except ' + productArray);
        }
    })

}

function sendUploadCompletionEmail(params, actualProductsCount, noOfNewProducts, noOfupdatedProducts, noOfNotUploadproducts) {
    var html = "";
    html += '<b>Date</b> :' + new Date();
    html += '<br> <b>File Name</b>: ' + params.fileName;
    html += '<br> <b>' + actualProductsCount + '</b> Of items in incoming File';
    html += '<br> <b>' + noOfNewProducts + '</b>  of New Items Added';
    html += '<br> <b>' + noOfupdatedProducts + '</b>  Of Existing Item Updated';
    html += '<br> <b>' + noOfNotUploadproducts + '</b>  Of Items not uploaded';
    var finalParamEmailInfo = {
            to: 'support@optcentral.com',
            from: config.sendgrid.sender,
            subject: 'HW Catalog Import Completed',
            html: html
        }
        //Send sitemap url
    sendgrid.send(finalParamEmailInfo, function(err, json) {
        if (err) return console.error(err);
        console.log(json)
        if (json) console.log('@@@@@@@@@ Catalog Email Sent to @@@@@@ support@optcentral.com');
    });
    finalParamEmailInfo.to = 'sunil@optcentral.com';
    sendgrid.send(finalParamEmailInfo, function(err, json) {
        if (err) return console.error(err);
        if (json) console.log('')
    });


}
