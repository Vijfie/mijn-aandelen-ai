const newsService = require("./newsService");
newsService.getStockNews("AAPL", "Apple").then(result => {
  console.log("Articles:", result.articles.length);
  console.log("Overall sentiment:", result.summary.overallSentiment + "%");
  console.log("First article:", result.articles[0]?.title);
  console.log("First sentiment:", result.articles[0]?.sentiment);
});
