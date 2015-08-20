
/**
 *
 */

module.exports = {

  server: {
    port: 3000
  },

  mongodb: {
    uri: 'mongodb://166.78.62.20/hw_development'
  },
 standalone: {
    port: 3001
  },
  debug :true,
  sendgrid: {
    sender: 'kaushik@optcentral.com',
    username: 'hintwhisper',
    password: 'Optcentral2005'
  },
  optFtp:{
    conn:{
      host: "192.168.1.22",
      port: 3721 // defaults to 21
      // user: "user", // defaults to "anonymous"
      // pass: "1234" // defaults to "@anonymous"
    },
    remoteDir : './temp',
    cronTime: '*/1 * * * *'
  },
  redis: {
    prefix: 'hw:',
    host: 'aws-us-east-1-portal.3.dblayer.com',
    port: 10092,
    auth_pass: 'VLACRXDXIICONYRI',
    expiry: 60
  },
  wp: {
    baseUrl: 'http://hwstage.com/wpress/wp-json'
  },
  amazon: {
    accessKeyId:'',
    secretAccessKey:'',
    region:''
  },
  amazonbucket:'hw/development',
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
