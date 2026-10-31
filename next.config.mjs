/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'recharts',
      'framer-motion',
      '@tanstack/react-query',
      '@tanstack/react-table',
      'sonner',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-popover',
    ],
  },
  turbopack: {},
  webpack: (config) => {
    config.output = config.output || {};
    config.output.chunkLoadTimeout = 300000; // 5 minutes to prevent ChunkLoadError timeouts
    return config;
  },
  // All API calls proxy through Next.js to avoid CORS in dev
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
    const cleanApiUrl = apiUrl.replace(/\/$/, '');
    return [
      {
        source: '/api/backend/:path*',
        destination: `${cleanApiUrl}/:path*`,
      },
      {
        source: '/api/v1/:path*',
        destination: `${cleanApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
