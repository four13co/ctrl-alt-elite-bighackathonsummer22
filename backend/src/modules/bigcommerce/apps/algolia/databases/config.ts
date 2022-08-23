export const dbConnection = {
  url: process.env.ALGOLIA_MONGODB,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
};
