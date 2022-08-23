import axios from 'axios'

const backend_url = process.env.BULKIMAGE_SERVER_URL;

export const bulkImageAuthController = {
    getAccount:(id) =>
        axios.get(`${backend_url}/account/${id}`),
    verifyPayload:(data) =>
        axios.get(`${backend_url}/verify/${data}`),
};

