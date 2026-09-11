/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  generateBuildId: async () => {
    return 'gem-compliance-build-prod';
  },
};

export default nextConfig;
