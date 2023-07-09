const PORT = process.env.PORT || 3000;
const app = require("./Main");

app.listen(PORT, () => {
  console.log(`Server Started on Port Number : ${PORT}`);
});
