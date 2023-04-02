import axios from 'axios';
import { WATERFLAKE_API } from '../../config/configuration';

export default function getAxios() {
  return axios.create({
    baseURL: `${WATERFLAKE_API}`,
    headers: {
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
    },
  });
}
