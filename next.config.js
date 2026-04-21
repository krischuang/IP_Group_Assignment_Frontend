/** @type {import('next').NextConfig} */
const path = require("path");
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    sassOptions: {
        includePaths: [path.join(__dirname, "styles")],
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/home',
                permanent: true,
            },
        ]
    },
};

module.exports = nextConfig;
