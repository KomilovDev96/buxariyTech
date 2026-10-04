import type { NextConfig } from 'next';
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error('NEXT_PUBLIC_SITE_URL must be set to the real HTTPS site URL in production');
}
const media = new URL(process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:59000/buhariy-media');
const config: NextConfig = {
  transpilePackages: ['@buhariy/contracts'],
  images: {
    remotePatterns: [
      {
        protocol: media.protocol.replace(':', '') as 'http' | 'https',
        hostname: media.hostname,
        port: media.port,
        pathname: `${media.pathname}/**`,
      },
    ],
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};
export default config;
