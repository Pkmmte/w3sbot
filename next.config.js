/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		// Disable ESLint during builds
		ignoreDuringBuilds: true,
	},
	typescript: {
		// Disable TypeScript type checking during builds
		ignoreBuildErrors: true,
	},
}

export default nextConfig

