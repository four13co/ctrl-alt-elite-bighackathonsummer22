import axios from 'axios'

const backend_url = process.env.BULKIMAGE_SERVER_URL;

export const webDavController = {
    connect:(data) =>
        axios.post(`${backend_url}/webdav`, data),
    upload:(data) =>
        axios.post(`${backend_url}/upload`, data, {headers: {'Content-Type': 'multipart/form-data'}}),
    save:(data) => 
        axios.put(`${backend_url}/apps`, data, {headers: {'Authorization': `Bearer ${data.token}`}}),
    getImages:(data) =>
        axios.get(`${backend_url}/get-images/${data.storeHash}`, {headers: {'Authorization': `Bearer ${data.token}`}}),
    searchProducts:(data) =>
        axios.get(`${backend_url}/search/${data.storeHash}/${data.searchParams}`, {headers: {'Authorization': `Bearer ${data.token}`}}),
    tagProducts:(data) =>
        axios.put(`${backend_url}/update-tags`, data, {headers: {'Authorization': `Bearer ${data.token}`}}),
          
};

