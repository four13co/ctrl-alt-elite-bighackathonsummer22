export const dbConnection = {
  url: process.env.NFT_MONGODB,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
};
