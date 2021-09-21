/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: [
      "pill-city.s3.us-west-2.amazonaws.com",
      "pill.city",
      "s3.us-west-2.amazonaws.com",
    ],
  },
};
