
/**
 *
 */

module.exports = {

  server: {
    port: 3000,
    host: 'http://hwstage.com',
    api: 'http://api.hwstage.com'
  },

  standalone: {
    port: 3001
  },

  mongodb: {
    uri: 'mongodb://handw:Optcentral2005@mongo.hw.mod.ec:27017/ohetaD8y'
  },

  redis: {
    prefix: 'hw:',
    host: 'aws-us-east-1-portal.2.dblayer.com',
    port: 10079,
    auth_pass: 'UWWVKZHGFMYDJVZN',
    expiry: 60
  },

  sendgrid: {
    sender: 'kaushik@optcentral.com',
    username: 'hintwhisper',
    password: 'Optcentral2005'
  },
  optFtp:{
    conn:{
      host: "feeds.optcentral.com",
      port: 21, // defaults to 21
      user: "hwfields", // defaults to "anonymous"
      pass: "handW0515" // defaults to "@anonymous"
    },
    remoteDir : '/Catalog_Feeds_HW_QA/',
    cronTime: '*/5 * * * *'
  },
  sentry: {
    dsn: 'https://e11d71392fc946f1b78f340b1e5fa404:3442d46c4c28433d8c48f079910be5d9@app.getsentry.com/41461'
  },

  wp: {
    baseUrl: 'http://hwstage.com/wpress/wp-json'
  },

  globalBrandProduct: ['trial', 'Kaushik', 'allow-chat'],

  productBrandGlobal: ['trial-2'],
  amazon: {
    accessKeyId:'AKIAJNHNUCPCYIISZKPQ',
    secretAccessKey:'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'
  },
  amazonbucket:'hw/staging',
  brand: {
    rules: {
      meta: '',
      settings: '',
      sku: 'sku',
      optId: 'sku',
      images: 'images',
      title: 'styleNumber', // subject to change
      price: 'regular_price',
      type: 'tax:product_type',
      description: 'meta:description',

      // new uploader start -------------
      optId: 'brandId',
      status: 'status',
      sectors: 'sectors',
      optName: 'brandName',
      categories: 'categories',
      optStyleName: 'styleName',
      productGroup: 'productGroup',
      optStyleNumber: 'styleNumber',
      optReferenceNumber: 'referenceNumber',

      list: 'pricing_list',
      retail: 'pricing_retail',
      savings: 'pricing_savings',
      endRange: 'pricing_endRange',
      wholesale: 'pricing_wholesale',
      startRange: 'pricing_startRange',

      quantity: 'inventory_quantity',
      stockstatus: 'inventory_stockStatus',

      seo_h1tag: 'seo_h1tag',
      seo_title: 'seo_title',
      seo_seoUrl: 'seo_seoUrl',
      seo_pageDesc: 'seo_pageDesc',
      seo_keywords: 'seo_keywords',
      seo_metaDescription: 'seo_metaDescription',


      weight: 'shipping_weight',
      dimensions_width: 'shipping_dimensions_width',
      dimensions_height: 'shipping_dimensions_height',
      dimensions_length: 'shipping_dimensions_length',

      // additional Cross-Brand-Search(CBS) data
      // optId: 'meta:brand_id', - confirm with waseem
      // optName: 'meta:brand_name',
      attributes: '' //should be a combination of attribute:pa_<property>
    }
  }

};
