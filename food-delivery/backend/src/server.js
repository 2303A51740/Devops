
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Food Delivery API running at http://localhost:${PORT}`);
});
