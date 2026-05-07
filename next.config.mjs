/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.cloudinary.com" },
      { protocol: "https", hostname: "*.amazonaws.com" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs"],
  },
};

export default nextConfig;
