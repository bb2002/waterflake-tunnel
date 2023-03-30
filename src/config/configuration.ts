export const WATERFLAKE_API = 'http://localhost:3000';

export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 3000,
  REGION_NAME: process.env.REGION_NAME || '',
  ACCESS_TOKEN: process.env.ACCESS_TOKEN || '',
});
