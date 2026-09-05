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
  // All API calls proxy through Next.js to avoid CORS in dev
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    if (!apiUrl || (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://') && !apiUrl.startsWith('/'))) {
      return [];
    }
    return [
      {
        source: '/api/backend/:path*',
        destination: `${apiUrl.replace(/\/$/, '')}/:path*`,
      },
    ];
  },
};

export default nextConfig;
