const axios = require('axios');

exports.getData = async function (url, method) {
  console.log(url, method)
  const res = await axios({
    url: url,
    method: method
  });

  return res.data;
}