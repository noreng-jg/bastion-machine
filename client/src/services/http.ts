import axios from 'axios';

export default axios.create({
  baseURL: 'http://localhost:2224/api',
  withCredentials: false,
  headers: {
    "Content-type": "application/json",
  }
});
