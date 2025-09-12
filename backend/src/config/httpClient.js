import axios from 'axios';
import config from './Config.js';

const httpClinet = axios.create({
    baseURL : config.DJANGO_API_URL,
    timeout : 10000,
    headers : {
        "Content-Type" : "application/json",
    },
});

export default httpClinet;