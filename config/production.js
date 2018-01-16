
/**
 *
 */

module.exports = {

  server: {
    port: 3000,
    host: 'http://hintandwhisper.com',
    api: 'http://api.hintandwhisper.com'
  },

  standalone: {
    port: 3001
  },
  debug: false,
  mongodb: {
    uri: 'mongodb://handw:Optcentral2005@mongo.hw.mod.ec:27017/gyq7uQyp'
  },

  redis: {
    prefix: 'hw:',
    host: 'aws-us-east-1-portal.1.dblayer.com',
    port: 10779,
    auth_pass: 'XRIKAWPOQBURKHNF',
    expiry: 60
  },
  optFtp:{
    conn:{
      host: "feeds.optcentral.com",
      port: 21, // defaults to 21
      user: "hwfields", // defaults to "anonymous"
      pass: "handW0515" // defaults to "@anonymous"
    },
    remoteDir : '/Catalog_Feeds_HW_Live/',
    cronTime: '*/1 * * * *'
  },
  sendgrid: {
    sender: 'kaushik@optcentral.com',
    username: 'hintwhisper',
    password: 'Optcentral2005'
  },

  sentry: {
    dsn: 'https://decebfd262854ef29704e3a097721d22:359d16e47c164a5e84d11975fd6d36ca@app.getsentry.com/41458'
  },

  wp: {
    baseUrl: 'http://hintandwhisper.com/wpress/wp-json'
  },

  globalBrandProduct: ['allow-product-ecommerce','allow-product-price-display','allow-product-complete-ring','allow-product-lds','allow-product-appointment','allow-product-contact','allow-product-live-chat','allow-product-where-to-buy','allow-lds-ecommerce','allow-lds-price-display','allow-lds-contact','allow-lds-appointment','allow-lds-live-chat','allow-lds-complete-ring',],

  productBrandGlobal: ['trial-2'],
  amazon: {
    accessKeyId:'AKIAJNHNUCPCYIISZKPQ',
    secretAccessKey:'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'
  },
  amazonbucket:'hw-development',
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