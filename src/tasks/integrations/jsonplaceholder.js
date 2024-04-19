const axios = require("axios");

const jsonplaceholderAxios = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com"
})

exports.listTodos = async () => {
  const response = await jsonplaceholderAxios.get("/todos")
  return response.data;
}
