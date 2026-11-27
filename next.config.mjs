const isDev = process.env.NODE_ENV !== 'production';

const originOf = (value) => {
  try {
    return new URL(value).origin;
  } catch {
    return '';
  }
};

// Content-Security-Policy. Next.js needs inline scripts for hydration, so 'unsafe-inline' stays for scripts
// (dev also needs 'unsafe-eval'); everything else is locked down. Framing is denied entirely.
const connectOrigins = [
  "'self'",
  originOf(process.env.NEXT_PUBLIC_API_URL),
  originOf(process.env.NEXT_PUBLIC_SOCKET_URL),
  'https://maps.googleapis.com',
  ...(isDev ? ['http://localhost:*', 'ws://localhost:*', 'http://127.0.0.1:*', 'ws://127.0.0.1:*'] : []),
].filter(Boolean);

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://maps.googleapis.com https://maps.gstatic.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  `connect-src ${connectOrigins.join(' ')}`,
  "frame-src 'self' blob: data: https:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // geolocation=(self) is needed for the "Use my location" button in campus settings
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(self), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
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
