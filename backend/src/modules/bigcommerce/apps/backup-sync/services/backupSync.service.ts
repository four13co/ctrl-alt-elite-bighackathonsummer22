// import { logger } from '@utils/logger';

// import { Connection } from '../interfaces/connections.interface';
// import { Job } from '../interfaces/jobs.interface';
// import TranzettaWrapper from '@/apis/tranzetta/tranzetta-wrapper';
// import Store from '../models/view/Store.model';
// import ApiKey from '../models/view/ApiKey.model';
// import { Category, Product } from '../../../../../apis/bigcommerce/interfaces/products.interface';
// import { BlogPost, Brand, CatalogCategory, Page } from '../../../../../apis/bigcommerce/interfaces/catalog.interface';
// import { ResolutionType } from '../models/enum/resolutionType.enum';
// import WasabiService from '@services/wasabi.service';
// import BackupHistoryService from '../services/backupHistories.service';
// import JobHistoryService from './jobHistories.service';
// import { BUCKET_KEY } from '@modules/bigcommerce/apps/backup-sync/constants';
// import { Agenda } from 'agenda/dist';
// import { StatusType } from '../../backup-sync/models/enum/statusType.enum';
// import { EntityType } from '../../backup-sync/models/enum/entityType.enum';


// class BackupSyncService {
//   protected productList: Product[];
//   protected categoryList: CatalogCategory[];
//   protected brandList: Brand[];
//   protected blogPostList: BlogPost[];

//   private getBigCommerceStore(connection: Connection): TranzettaWrapper {
//     try {
//       const apiKey = new ApiKey();
//       const api = apiKey.getApiKeys(connection.clientId, connection.accessToken, 'JSON', connection.storeHash, 'v3');
//       const tranzettaWrapper = new TranzettaWrapper();
//       tranzettaWrapper.initSync(api);

//       return tranzettaWrapper;
//     } catch (error) {
//       logger.error(`print error ${error}`);
//     }
//   }


//   private async buildByType(connection: Connection, ids: any[], type: EntityType, isSyncRestore: boolean): Promise<any> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     const store = new Store(connection.storeHash);

//     if (type === EntityType.PRODUCT) {
//       let products = [];
//       if (isSyncRestore) {
//         products = await tranzettaWrapper.getProducts();
//         store.setProducts(products);
//         return store;
//       } else {
//         products = await this.getProductByIds(connection, ids);
//         const productList = [];
//         const brands = [];
//         const categories = [];
//         await Promise.all(
//           products.map(async product => {
//             if (product.brand_id != 0) {
//               const brand = await this.getBrandById(connection, product.brand_id);
//               if (brands.length > 0) {
//                 if (!brands.some(b => b.id === brand.id)) {
//                   brands.push(brand);
//                 }
//               } else {
//                 brands.push(brand);
//               }
//             }

//             if (product.categories.length > 0) {
//               const catList = await this.getCategoriesById(connection, product.categories);
//               catList.map(cat => {
//                 if (categories.length > 0) {
//                   if (!categories.some(b => b.id === cat.id)) {
//                     categories.push(cat);
//                   }
//                 } else {
//                   categories.push(cat);
//                 }
//               });
//             }

//             productList.push(product);
//           }),
//         );
//         store.setProducts(productList);
//         store.setCategories(categories);
//         store.setBrands(brands);
//         return store;
//       }
//     } else if (type === EntityType.CATEGORY) {
//       let categories: CatalogCategory[];
//       if (isSyncRestore) {
//         categories = await tranzettaWrapper.getCategories();
//       } else {
//         categories = await this.getCategoriesById(connection, ids);
//       }

//       store.setCategories(categories);
//       return store;
//     } else if (type === EntityType.BRANDS) {
//       let brands: Brand[];
//       if (isSyncRestore) {
//         brands = await tranzettaWrapper.getBrands();
//       } else {
//         brands = await this.getBrandByIds(connection, ids);
//       }

//       store.setBrands(brands);
//       return store;
//     } else if (type === EntityType.BLOGPOST) {
//       const blogPosts: BlogPost[] = await tranzettaWrapper.getBlogPosts();
//       if (isSyncRestore) {
//         const filterBlogPosts = blogPosts.filter(function (blog) {
//           return ids.some(function (id) {
//             return Number(id) === blog.id;
//           });
//         });
//         store.setblogPosts(filterBlogPosts)
//       } else {
//         store.setblogPosts(blogPosts);
//       }
//       return store;
//     }


//   }

//   /**
//    * @job Job details
//    */
//   public async backup(job: Job) {
//     const jsonStr = JSON.stringify(job.contents);
//     const jobEntity = JSON.parse(jsonStr);
//     this.createJobHistory(job, Date.now().toString(), StatusType.IN_PROGRESS)


//     if (jobEntity.products && jobEntity.products.length > 0) {
//       const store = await this.buildByType(job.sourceId, jobEntity.products, EntityType.PRODUCT, false);
//       this.typeBackup(job, store);
//     }
//     if (jobEntity.categories && jobEntity.categories.length > 0) {
//       const store = await this.buildByType(job.sourceId, jobEntity.categories, EntityType.CATEGORY, false);
//       this.typeBackup(job, store);
//     }
//     if (jobEntity.brands && jobEntity.brands.length > 0) {
//       const store = await this.buildByType(job.sourceId, jobEntity.brands, EntityType.BRANDS, false);
//       this.typeBackup(job, store);
//     }
//     if (jobEntity.blogPosts && jobEntity.blogPosts.length > 0) {
//       const store = await this.buildByType(job.sourceId, jobEntity.blogPost, EntityType.BLOGPOST, false);
//       this.typeBackup(job, store);
//     }
//   }

//   private async typeBackup(job: Job, store: any) {
//     const { storeHash } = store;
//     const datetime = Date.now().toString();

//     // declare the bucket name
//     const wasabi = new WasabiService(`${BUCKET_KEY}${storeHash} `);
//     // BackupHistory Run
//     // status ==> in progress

//     try {
//       /**
//        * @name filename===datetime
//        * @data convert store data to string
//        * remove storeHash since its unnecessary to store it
//        */

//       await wasabi.putObject({
//         name: datetime,
//         data: JSON.stringify({ store, storeHash: undefined }),
//       });

//       this.createBackupHistory(job._id, datetime, 'BACKUP : success');
//       this.createJobHistory(job, datetime, StatusType.SUCCESS)

//       // BackupHistory Run
//       // status ==> success
//     } catch (error) {
//       // BackupHistory Run
//       // status ==> failed
//       logger.error(error);
//     }
//   }

//   /**
//    * @job Job details
//    */
//   public async sync(agenda: Agenda, job: Job) {
//     const jsonStr = JSON.stringify(job.contents);
//     const jobEntity = JSON.parse(jsonStr);

//     this.createJobHistory(job, Date.now().toString(), StatusType.IN_PROGRESS)

//     if (jobEntity.products && jobEntity.products.length > 0) {
//       this.typeSync(agenda, job, jobEntity.products, EntityType.PRODUCT);
//     }
//     if (jobEntity.categories && jobEntity.categories.length > 0) {
//       this.typeSync(agenda, job, jobEntity.categories, EntityType.CATEGORY);
//     }
//     if (jobEntity.brands && jobEntity.brands.length > 0) {
//       this.typeSync(agenda, job, jobEntity.brands, EntityType.BRANDS);
//     }
//     if (jobEntity.blogPosts && jobEntity.blogPosts.length > 0) {
//       this.typeSync(agenda, job, jobEntity.blogPosts, EntityType.BLOGPOST);
//     }
//   }

//   private async typeSync(agenda: Agenda, job: Job, ids: [any], type: EntityType) {
//     //Get data from Bigcommerce data
//     const srcStore = await this.buildByType(job.sourceId, ids, type, false);
//     if (type === EntityType.PRODUCT) {

//       const srcProductSku = []

//       const storeProducts = srcStore.products
//       //Id can change , name can change. Is unique to track / identify product
//       if (storeProducts) {
//         storeProducts.forEach(product => {
//           srcProductSku.push(product.sku)
//         });
//       }


//       //get all product from destination by sku from source
//       const conflictProductList = await this.getProductBySku(job.destinationId, srcProductSku)

//       if (conflictProductList && conflictProductList.length > 0) {
//         if (job.conflictRes === ResolutionType.STOP_JOB) {
//           await this.stopJob(agenda, job, type)
//         } else if (job.conflictRes === ResolutionType.IGNORE_AND_UPDATE || job.conflictRes === ResolutionType.INSERT_NON_CONFLICT) {
//           if (job.conflictRes === ResolutionType.IGNORE_AND_UPDATE) {
//             await Promise.all(
//               conflictProductList.map(async product => {
//                 let srcProduct = storeProducts.find(e => e.sku === product.sku)
//                 if (srcProduct.brand_id > 0) {
//                   if (srcProduct.brand_id != product.brand_id) {
//                     let brand = await this.getBrandById(job.destinationId, srcProduct.brand_id)
//                     if (brand) {
//                       srcProduct.brand_id = brand.id
//                     }
//                   }
//                 }
//                 if (srcProduct.categories.length > 0) {
//                   let categories = await this.getCategoriesById(job.destinationId, srcProduct.categories);

//                   let catNames = await this.getCategoriesById(job.sourceId, srcProduct.categories);

//                   let names = []
//                   catNames.map(cat => {
//                     names.push(cat.name)
//                   })

//                   let ids = []
//                   categories.map(cat => {
//                     ids.push(cat.id)
//                   })

//                   let categoriesNameIds = await this.getCategoryByNames(job.destinationId, names);

//                   if (categoriesNameIds && categoriesNameIds.length > 0) {

//                     ids.push(...categoriesNameIds.filter(function (p1) {
//                       return !categories.some(function (p2) {
//                         return p2.id === p1.id
//                       })
//                     }))

//                   }

//                   if (ids && ids.length > 0) {

//                     srcProduct.categories = ids
//                   }

//                 }

//                 await this.updateProduct(job.destinationId, product.id, srcProduct)
//               }))
//           }

//           const newProductList = storeProducts.filter(function (p1) {
//             return !conflictProductList.some(function (p2) {
//               return p2.sku === p1.sku
//             })
//           })
//           if (newProductList) {
//             await Promise.all(
//               newProductList.map(async product => {
//                 await this.createProduct(job.destinationId, product);
//               })
//             );
//           }

//           const datetime = Date.now().toString();
//           this.createBackupHistory(job._id, datetime, `SYNC ${type} : ${job.conflictRes}`);
//           this.createJobHistory(job, datetime, StatusType.SUCCESS)
//         }
//       } else if (job.conflictRes === ResolutionType.INSERT_NON_CONFLICT || job.conflictRes === ResolutionType.IGNORE_AND_UPDATE) {
//         await Promise.all(
//           storeProducts.map(async product => {
//             await this.createProduct(job.destinationId, product);
//           }))
//         const datetime = Date.now().toString();
//         this.createBackupHistory(job._id, datetime, `SYNC ${type} : ${job.conflictRes}`);
//         this.createJobHistory(job, datetime, StatusType.SUCCESS)
//       }
//     } else if (type === EntityType.CATEGORY) {
//       const storeCategories = srcStore.categories

//       //get all category from destination paginated,
//       //id  and name can be change but can have same url.
//       //url would be the last resort of uniqueness
//       let destinationCategories = await this.getPaginatedCategories(job.destinationId)

//       const conflictCategory = destinationCategories.filter(function (p1) {
//         return storeCategories.some(function (p2) {
//           return p2.id === p1.id || p2.name === p1.name || p2.custom_url && p1.custom_url && p2.custom_url.url === p1.custom_url.url
//         })
//       })

//       const newCategories = storeCategories.filter(function (p1) {
//         return !destinationCategories.some(function (p2) {
//           return p2.id === p1.id || p2.name === p1.name || p2.custom_url && p1.custom_url && p2.custom_url.url === p1.custom_url.url
//         })
//       })


//       //category conflict by name
//       //getPaginatedCategories

//       if (conflictCategory && conflictCategory.length > 0) {

//         if (job.conflictRes === ResolutionType.STOP_JOB) {
//           await this.stopJob(agenda, job, type)
//         } else if (job.conflictRes === ResolutionType.IGNORE_AND_UPDATE || job.conflictRes === ResolutionType.INSERT_NON_CONFLICT) {
//           if (job.conflictRes === ResolutionType.IGNORE_AND_UPDATE) {

//             await Promise.all(
//               conflictCategory.map(async category => {
//                 let srcCategory = storeCategories.find(e => e.name === category.name || e.id === category.id || e.custom_url.url === category.custom_url.url)

//                 await this.updateCategoryById(job.destinationId, category.id, srcCategory)
//               }))
//           }

//           if (newCategories) {
//             await Promise.all(
//               newCategories.map(async cat => {
//                 await this.createCategory(job.destinationId, cat);
//               }))
//           }
//           const datetime = Date.now().toString();
//           this.createBackupHistory(job._id, datetime, `SYNC ${type} : ${job.conflictRes}`);
//           this.createJobHistory(job, datetime, StatusType.SUCCESS)
//         }

//       } else if (job.conflictRes === ResolutionType.INSERT_NON_CONFLICT || job.conflictRes === ResolutionType.IGNORE_AND_UPDATE) {
//         await Promise.all(
//           storeCategories.map(async cat => {
//             await this.createCategory(job.destinationId, cat)
//           }))
//         const datetime = Date.now().toString();
//         this.createBackupHistory(job._id, datetime, `SYNC ${type} : INSERT_NON_CONFLICT`);
//         this.createJobHistory(job, datetime, StatusType.SUCCESS)
//       }

//     } else if (type === EntityType.BRANDS) {
//       const storeBrands = srcStore.brands

//       //id  and name can be change but can have same url.
//       //url would be the last resort of uniqueness
//       let destinationBrand = await this.getPaginatedBrands(job.destinationId)

//       const conflictBrand = destinationBrand.filter(function (p1) {
//         return storeBrands.some(function (p2) {
//           return p2.id === p1.id || p2.name === p1.name || p2.custom_url && p1.custom_url && p2.custom_url.url === p1.custom_url.url
//         })
//       })

//       const newBrands = storeBrands.filter(function (p1) {
//         return !destinationBrand.some(function (p2) {
//           return p2.id === p1.id || p2.name === p1.name || p2.custom_url && p1.custom_url && p2.custom_url.url === p1.custom_url.url
//         })
//       })

//       if (conflictBrand && conflictBrand.length > 0) {
//         if (job.conflictRes === ResolutionType.STOP_JOB) {
//           await this.stopJob(agenda, job, type)
//         } else if (job.conflictRes === ResolutionType.IGNORE_AND_UPDATE || job.conflictRes === ResolutionType.INSERT_NON_CONFLICT) {
//           if (job.conflictRes === ResolutionType.IGNORE_AND_UPDATE) {
//             await Promise.all(
//               conflictBrand.map(async brand => {
//                 let srcBrand = storeBrands.find(e => e.id === brand.id || e.name === brand.name || e.custom_url.url === brand.custom_url.url)
//                 await this.updateBrand(job.destinationId, brand.id, srcBrand)
//               }))
//           }

//           if (newBrands) {
//             await Promise.all(
//               newBrands.map(async brnd => {
//                 await this.createBrand(job.destinationId, brnd);
//               }))
//           }
//           const datetime = Date.now().toString();
//           this.createBackupHistory(job._id, datetime, `SYNC ${type} : ${job.conflictRes}`);
//           this.createJobHistory(job, datetime, StatusType.SUCCESS)
//         }
//       } else if (job.conflictRes === ResolutionType.INSERT_NON_CONFLICT || job.conflictRes === ResolutionType.IGNORE_AND_UPDATE) {
//         await Promise.all(
//           storeBrands.map(async brnd => {
//             await this.createBrand(job.destinationId, brnd)
//           }))
//         const datetime = Date.now().toString();
//         this.createBackupHistory(job._id, datetime, `SYNC ${type} : ${job.conflictRes}`);
//         this.createJobHistory(job, datetime, StatusType.SUCCESS)
//       }
//     } else if (type === EntityType.BLOGPOST) {


//       //preview_url
//       const srcBlogUrl = []
//       const blogPosts = srcStore.blogPosts
//       //Id can change , name can change. Is unique to track / identify product
//       if (blogPosts) {
//         blogPosts.forEach(b => {
//           srcBlogUrl.push(b.preview_url)
//         });
//       }

//       //get all category from destination by sku from source
//       const conflictBlog = await this.getBlogPostByUrl(job.destinationId, srcBlogUrl)
//       if (conflictBlog && conflictBlog.length > 0) {
//         if (job.conflictRes === ResolutionType.STOP_JOB) {
//           await this.stopJob(agenda, job, type)
//         } else if (job.conflictRes === ResolutionType.IGNORE_AND_UPDATE || job.conflictRes === ResolutionType.INSERT_NON_CONFLICT) {
//           if (job.conflictRes === ResolutionType.IGNORE_AND_UPDATE) {
//             await Promise.all(
//               conflictBlog.map(async blog => {
//                 let srcBlog = blogPosts.find(e => e.preview_url === blog.preview_url)
//                 await this.updateBlogPost(job.destinationId, blog.id, srcBlog)
//               }))
//           }

//           const newBlog = blogPosts.filter(function (p1) {
//             return !conflictBlog.some(function (p2) {
//               return p2.preview_url === p1.preview_url
//             })
//           })

//           if (newBlog) {
//             await Promise.all(
//               newBlog.map(async b => {
//                 await this.createBlogPost(job.destinationId, b);
//               }))
//           }
//           const datetime = Date.now().toString();
//           this.createBackupHistory(job._id, datetime, `SYNC ${type} : ${job.conflictRes}`);
//           this.createJobHistory(job, datetime, StatusType.SUCCESS)
//         }

//       } else if (job.conflictRes === ResolutionType.INSERT_NON_CONFLICT || job.conflictRes === ResolutionType.IGNORE_AND_UPDATE) {
//         await Promise.all(
//           blogPosts.map(async blog => {
//             await this.createBlogPost(job.destinationId, blog)
//           }))
//         const datetime = Date.now().toString();
//         this.createBackupHistory(job._id, datetime, `SYNC ${type} : ${job.conflictRes}`);
//         this.createJobHistory(job, datetime, StatusType.SUCCESS)
//       }
//     }
//   }

//   private async stopJob(agenda: Agenda, job: Job, type: EntityType) {
//     const datetime = Date.now().toString();
//     this.createBackupHistory(job._id, datetime, `SYNC ${type} : Stop Due to Conflict(s)`);
//     this.createJobHistory(job, datetime, StatusType.SUCCESS)
//     await agenda.stop();
//     process.exit(0);
//   }

//   public async restore(agenda: Agenda, job: Job) {
//     const jsonStr = JSON.stringify(job.contents);
//     const jobEntity = JSON.parse(jsonStr);

//     const wasabi = new WasabiService(`${BUCKET_KEY}${job.sourceHash} `);

//     const getFile = await wasabi.getObject(job.filename);

//     const wasabiFileStr = getFile.Body.toString('utf-8');
//     const storeObj = JSON.parse(wasabiFileStr);
//     const jsonObj = storeObj.store;

//     if (jobEntity.products && jobEntity.products.length > 0) {
//       this.typeRestore(agenda, jsonObj, job, jobEntity.products, EntityType.PRODUCT);
//     }
//     if (jobEntity.categories && jobEntity.categories.length > 0) {
//       this.typeRestore(agenda, jsonObj, job, jobEntity.categories, EntityType.CATEGORY);
//     }
//     if (jobEntity.brands && jobEntity.brands.length > 0) {
//       this.typeRestore(agenda, jsonObj, job, jobEntity.brands, EntityType.BRANDS);
//     }
//     if (jobEntity.blogPosts && jobEntity.blogPosts.length > 0) {
//       this.typeRestore(agenda, jsonObj, job, jobEntity.blogPost, EntityType.BLOGPOST);
//     }
//   }



//   private async typeRestore(agenda: Agenda, jsonObj: any, job: Job, ids: [any], type: EntityType) {
//     //get all from destination
//     this.createJobHistory(job, Date.now().toString(), StatusType.IN_PROGRESS)
//     const destinationStore = await this.buildByType(job.destinationId, [], type, true);


//     if (type === EntityType.PRODUCT) {
//       await Promise.all(
//         ids.map(async entityId => {
//           const product = jsonObj.products.find(p => p.id === Number(entityId));
//           if (product) {
//             const destinationProduct = destinationStore.products.find(
//               p => p.name === product.name || p.sku === product.sku || p.custom_url.url === product.custom_url.url,
//             );
//             if (destinationProduct) {
//               if (job.conflictRes && job.conflictRes === ResolutionType.STOP_JOB) {
//                 const datetime = Date.now().toString();
//                 this.createBackupHistory(job._id, datetime, `RESTORE ${type} : Stop Due to Conflict(s)`);
//                 this.createJobHistory(job, datetime, StatusType.SUCCESS)
//                 await agenda.stop();
//                 process.exit(0);
//               } else if (!job.conflictRes || job.conflictRes && job.conflictRes === ResolutionType.IGNORE_AND_UPDATE) {
//                 //FOR CATEGORIES
//                 //job.conflictRes does not have a default value for now
//                 if (product.categories.length > 0) {
//                   const destinationCategories = await this.buildByType(job.destinationId, destinationProduct.categories, EntityType.CATEGORY, true);
//                   const nonConflictCategory = product.categories.filter(function (id) {
//                     return !destinationCategories.categories.some(function (cid) {
//                       return cid === id;
//                     });
//                   });

//                   if (nonConflictCategory.length > 0) {
//                     jsonObj.categories.forEach(async cat => {
//                       const catData = nonConflictCategory.find(id => id === cat.id);
//                       if (catData) {
//                         const updatedCat = destinationCategories.categories.find(c => c.name === cat.name || c.custom_url.url === cat.custom_url.url);
//                         if (updatedCat) {
//                           const index = product.categories.indexOf(cat.id);
//                           //set id from category
//                           product.categories[index] = updatedCat.id;
//                           await this.updateCategoryById(job.destinationId, updatedCat.id, cat)
//                         } else {
//                           const newCat = await this.createCategory(job.destinationId, cat);
//                           const index = product.categories.indexOf(cat.id);
//                           product.categories[index] = newCat.id;
//                         }
//                       }
//                     });
//                   }
//                 }

//                 //FOR BRANDS
//                 if (product.brand_id > 0) {
//                   const destinationBrand = await this.buildByType(job.destinationId, destinationProduct.brand_id, EntityType.BRANDS, true);
//                   const oldBrand = jsonObj.brands.find(brand => brand.id === product.brand_id);

//                   if (destinationBrand && destinationBrand.name === oldBrand.name) {
//                     product.brand_id = destinationProduct.brand_id
//                     await this.updateBrand(job.destinationId, product.brand_id, oldBrand)
//                   } else {
//                     product.brand_id = await this.createBrand(job.destinationId, oldBrand);
//                   }
//                 }
//                 //get destination ID and update with restored product
//                 await this.updateProduct(job.destinationId, destinationProduct.id, product);
//                 const datetime = Date.now().toString();
//                 this.createBackupHistory(job._id, datetime, `Restore ${type} : Finish`);
//                 this.createJobHistory(job, datetime, StatusType.SUCCESS)
//               }


//             } else {
//               //job.conflictRes does not have a default value for now
//               if (!job.conflictRes || job.conflictRes && job.conflictRes === ResolutionType.INSERT_NON_CONFLICT) {
//                 await this.createProduct(job.destinationId, product);
//                 const datetime = Date.now().toString();
//                 this.createBackupHistory(job._id, datetime, `Restore ${type} : Create Product`);
//                 this.createJobHistory(job, datetime, StatusType.SUCCESS)
//               }
//             }
//           }
//         }),
//       );
//     } else if (type === EntityType.CATEGORY) {
//       await Promise.all(
//         ids.map(async entityId => {
//           const cat = jsonObj.categories.find(c => c.id === Number(entityId));
//           if (cat) {
//             const destinationCat = destinationStore.categories.find(c => c.name === cat.name || c.custom_url.url === cat.custom_url.url);
//             if (destinationCat) {
//               if (job.conflictRes && job.conflictRes === ResolutionType.STOP_JOB) {
//                 const datetime = Date.now().toString();
//                 this.createBackupHistory(job._id, datetime, `RESTORE ${type} : Stop Due to Conflict(s)`);
//                 this.createJobHistory(job, datetime, StatusType.SUCCESS)
//                 await agenda.stop();
//                 process.exit(0);
//               } else if (!job.conflictRes || job.conflictRes && job.conflictRes === ResolutionType.IGNORE_AND_UPDATE) {
//                 await this.updateCategoryById(job.destinationId, destinationCat.id, cat);
//                 const datetime = Date.now().toString();
//                 this.createBackupHistory(job._id, datetime, `Restore ${type} : Finish`);
//                 this.createJobHistory(job, datetime, StatusType.SUCCESS)
//               }
//             } else {
//               if (!job.conflictRes || job.conflictRes === ResolutionType.INSERT_NON_CONFLICT) {
//                 await this.createCategory(job.destinationId, cat);
//                 const datetime = Date.now().toString();
//                 this.createBackupHistory(job._id, datetime, `Restore ${type} : Create Category`);
//                 this.createJobHistory(job, datetime, StatusType.SUCCESS)
//               }
//             }
//           }
//         }),
//       );
//     } else if (type === EntityType.BRANDS) {
//       await Promise.all(
//         ids.map(async entityId => {
//           const brand = jsonObj.brands.find(c => c.id === Number(entityId));
//           if (brand) {
//             const destinationBrand = destinationStore.brands.find(c => c.name === brand.name);
//             if (destinationBrand) {
//               if (job.conflictRes && job.conflictRes === ResolutionType.STOP_JOB) {
//                 const datetime = Date.now().toString();
//                 this.createBackupHistory(job._id, datetime, `RESTORE ${type} : Stop Due to Conflict(s)`);
//                 this.createJobHistory(job, datetime, StatusType.SUCCESS)
//                 await agenda.stop();
//                 process.exit(0);
//               } else if (!job.conflictRes || job.conflictRes && job.conflictRes === ResolutionType.IGNORE_AND_UPDATE) {
//                 await this.updateBrand(job.destinationId, destinationBrand.id, brand);
//                 const datetime = Date.now().toString();
//                 this.createBackupHistory(job._id, datetime, `Restore ${type} : Finish`);
//                 this.createJobHistory(job, datetime, StatusType.SUCCESS)
//               }
//             } else {
//               if (!job.conflictRes || job.conflictRes && job.conflictRes === ResolutionType.INSERT_NON_CONFLICT) {
//                 await this.createBrand(job.destinationId, brand);
//                 const datetime = Date.now().toString();
//                 this.createBackupHistory(job._id, datetime, `Restore ${type} : Create Brand`);
//                 this.createJobHistory(job, datetime, StatusType.SUCCESS)
//               }
//             }
//           }
//         }),
//       );
//     } else if (type === EntityType.BLOGPOST) {
//       await Promise.all(
//         ids.map(async entityId => {
//           const blog = jsonObj.blogPost.find(c => c.id === Number(entityId));
//           if (blog) {
//             const destinationBlog = destinationStore.brands.find(c => c.preview_url === blog.preview_url);
//             if (destinationBlog) {
//               if (job.conflictRes === ResolutionType.STOP_JOB) {
//                 const datetime = Date.now().toString();
//                 this.createBackupHistory(job._id, datetime, `SYNC ${type}  : Stop Due to Conflict(s)`);
//                 this.createJobHistory(job, datetime, StatusType.SUCCESS)
//                 await agenda.stop();
//                 process.exit(0);

//               } else if (!job.conflictRes || job.conflictRes === ResolutionType.IGNORE_AND_UPDATE) {
//                 await this.updateBlogPost(job.destinationId, destinationBlog.id, blog);
//                 const datetime = Date.now().toString();
//                 this.createBackupHistory(job._id, datetime, `Restore ${type} : Finish`);
//                 this.createJobHistory(job, datetime, StatusType.SUCCESS)
//               }
//             } else {
//               if (!job.conflictRes || job.conflictRes === ResolutionType.INSERT_NON_CONFLICT) {
//                 await this.createBlogPost(job.destinationId, blog);
//                 const datetime = Date.now().toString();
//                 this.createBackupHistory(job._id, datetime, `Restore ${type} : Create Blog Post`);
//                 this.createJobHistory(job, datetime, StatusType.SUCCESS)
//               }

//             }
//           }
//         }),
//       );
//     }
//   }

//   private createBackupHistory(jobId: any, datetime: string, message: string) {
//     const historyService = new BackupHistoryService();
//     historyService.createBackupHistory({
//       job: jobId,
//       datetime,
//       reference: message,
//     });
//   }

//   private async createJobHistory(job: Job, datetime: string, statusType: StatusType) {
//     const jobHistoryService = new JobHistoryService();
//     const jh = await jobHistoryService.findJobHistoryByJob(job)

//     if (jh) {
//       jh.status = statusType
//       jh.endDatetime = new Date(datetime)
//       jobHistoryService.updateJobHs(jh._id, jh)
//     } else {
//       jobHistoryService.createJobHistory({
//         job: job._id,
//         startDatetime: statusType === StatusType.IN_PROGRESS ? datetime : "",
//         endDatetime: statusType === StatusType.SUCCESS ? datetime : "",
//         runTime: 0,
//         status: statusType
//       })
//     }

//   }



//   //Create
//   public async createProduct(connection: Connection, product: Product): Promise<Product> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     delete product.id;
//     delete product.total_sold;
//     const prod: Product = await tranzettaWrapper.createProduct(product);
//     return prod;
//   }

//   public async createCategory(connection: Connection, category: CatalogCategory): Promise<any> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     delete category.id;
//     delete category.default_product_sort;
//     const cat: Category = await tranzettaWrapper.createCategories(category);
//     return cat;
//   }

//   public async createBrand(connection: Connection, brand: Brand): Promise<Brand> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     delete brand.id;
//     const prodBrand: any = await tranzettaWrapper.createBrand(brand);
//     return prodBrand;
//   }

//   public async createBlogPost(connection: Connection, blogPost: BlogPost): Promise<BlogPost> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     delete blogPost.id;
//     delete blogPost.preview_url;
//     delete blogPost.summary;
//     delete blogPost.published_date;
//     delete blogPost.published_date_iso8601;
//     return await tranzettaWrapper.createBlogPost(blogPost);
//   }

//   //GET
//   public async getBrandById(connection: Connection, brand_id: any): Promise<Brand> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     return await tranzettaWrapper.getBrandById(brand_id);
//   }
//   public async getBrandByIds(connection: Connection, query_categories: any[]): Promise<Brand[]> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     if (query_categories.length === 1) {
//       let brands = [await tranzettaWrapper.getBrandById(query_categories[0])]
//       return brands
//     } else {
//       return await tranzettaWrapper.getBrandByIds(query_categories);
//     }
//   }

//   public async getPaginatedBrands(connection: Connection): Promise<Brand[]> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     return await tranzettaWrapper.getPaginatedBrands();
//   }
//   public async getPaginatedCategories(connection: Connection): Promise<CatalogCategory[]> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     return await tranzettaWrapper.getPaginatedCategories();
//   }

//   public async getProductByIds(connection: Connection, query_categories: any[]): Promise<Product[]> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     return await tranzettaWrapper.getProductByIds(query_categories);
//   }

//   public async getCategoriesById(connection: Connection, query_categories: any[]): Promise<CatalogCategory[]> {

//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     if (query_categories.length === 1) {
//       return await tranzettaWrapper.getCategoriesById(Number(query_categories[0]))
//     } else {
//       return await tranzettaWrapper.getCategoriesByIds(query_categories);
//     }
//   }

//   public async getProductBySku(connection: Connection, skuIds: any[]): Promise<Product[]> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     return await tranzettaWrapper.getProductBySkuList(skuIds)
//   }

//   public async getCategoryByNames(connection: Connection, names: any[]): Promise<CatalogCategory[]> {
//     const catList = []
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     await Promise.all(
//       names.map(async name => {
//         const cat = await tranzettaWrapper.getCategoryByName(name)
//         if (cat && cat.length > 0) {
//           catList.push(...cat)
//         }

//       }))
//     return catList
//   }

//   public async getBrandByNames(connection: Connection, names: string[]): Promise<Brand[]> {
//     const brandList = []
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     await Promise.all(
//       names.map(async name => {
//         const brnd = await tranzettaWrapper.getBrandByName(name)
//         if (brnd) {
//           brandList.push(brnd)
//         }

//       }))
//     return brandList
//   }

//   public async getBlogPostByUrl(connection: Connection, urlList: string[]): Promise<BlogPost[]> {
//     const blogPost = []
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     await Promise.all(
//       urlList.map(async url => {
//         const blog = await tranzettaWrapper.getBlogPostByURL(url)
//         if (blog && blog.length > 0) {
//           blog.map(async b => {
//             blogPost.push(b)
//           })

//         }

//       }))
//     return blogPost
//   }

//   //Update
//   public async updateProduct(connection: Connection, id: number, product: Product): Promise<Product> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     if (product.total_sold > 1000000000) {
//       //I'm not sure why default product has greater than 1000000000
//       product.total_sold = 999999999;
//     }
//     return await tranzettaWrapper.updateProduct(id, product);
//   }

//   public async updateCategoryById(connection: Connection, category_id: any, category: CatalogCategory): Promise<CatalogCategory> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     return await tranzettaWrapper.updateCategoryById(category_id, category);
//   }

//   public async updateBlogPost(connection: Connection, id: any, blogPost: BlogPost): Promise<BlogPost> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     return await tranzettaWrapper.updateBlogPost(
//       id,
//       this.buildBlogPost(blogPost.title, blogPost.body, blogPost.tags, blogPost.is_published, blogPost.author, blogPost.thumbnail_path),
//     );
//   }

//   public async updateBrand(connection: Connection, id: any, brand: Brand): Promise<Brand> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     //exclude
//     delete brand.custom_url;
//     return await tranzettaWrapper.updateBrand(id, brand);
//   }

//   //Delete
//   public async deleteProductById(connection: Connection, id: number): Promise<void> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     tranzettaWrapper.deleteProduct(id);
//   }

//   public async deleteCategoryById(connection: Connection, category_id: any): Promise<void> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     tranzettaWrapper.deleteCategoryById(category_id);
//   }

//   public async deleteByBlogPostId(connection: Connection, id: any): Promise<void> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     tranzettaWrapper.deleteBlogPostById(id);
//   }

//   public async deleteBrandById(connection: Connection, brand_id: any): Promise<void> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     tranzettaWrapper.deleteBrandById(brand_id);
//   }

//   private buildBlogPost(title: string, body: string, tags: string[], is_published: boolean, author: string, thumbnail_path: string): any {
//     return { title, body, tags, is_published, author, thumbnail_path };
//   }

//   public async getAllStoreContents(
//     connection: Connection,
//   ): Promise<{ products: Product[]; categories: CatalogCategory[]; brands: Brand[]; blogPosts: BlogPost[]; }> {
//     const tranzettaWrapper = this.getBigCommerceStore(connection);
//     const [products, categories, brands, blogPosts] = await Promise.all([
//       await tranzettaWrapper.getProducts(),
//       await tranzettaWrapper.getCategories(),
//       await tranzettaWrapper.getBrands(),
//       await tranzettaWrapper.getBlogPosts(),
//       await tranzettaWrapper.getPages(),
//     ]);

//     return { products, categories, brands, blogPosts };
//   }
// }

// export default BackupSyncService;
