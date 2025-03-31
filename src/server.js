const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(process.env.PORT || 3000, () => {
  console.log(`サーバーが${PORT}番ポートで起動しました`);
});
