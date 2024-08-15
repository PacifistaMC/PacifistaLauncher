const axios = require('axios').default;

exports.getData = async function (url, method) {
    try {
        const res = await axios({
            url: url,
            method: method
        });

        if (res.status == 200) return {
            success: true,
            ...res.data
        };
        else return {
            success: false,
            error: res.data
        }
    } catch (err) {
        return {
            success: false,
            error: res.data
        }
    }
}