
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // This is required to allow the Next.js dev server to be accessed from the
  // Firebase Studio preview URL.
  experimental: {
    // This is the robust way to allow all subdomains.
    allowedForwardedHosts: ['**.cloudworkstations.dev'],
  },
  // This is required for HMR to work correctly.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensures HMR requests are served correctly over the proxied URL.
      config.output.publicPath = '/_next/';
    }
    return config;
  },
};

export default nextConfig;
