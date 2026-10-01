/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
	reactStrictMode: true,
	typedRoutes: true,
	images: {
		remotePatterns: [
			{	
				protocol: 'https',
				hostname: '**',
			},
			{
				protocol: 'http',
				hostname: '**',
			},
		],
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox; style-src 'unsafe-inline'; img-src * data:;",
	},
};
module.exports = nextConfig;
