import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Cloudflare / localhost.run tunnels hit /_next from a non-localhost host (dev only).
  allowedDevOrigins: [
    '*.trycloudflare.com',
    '*.lhr.life',
    '*.localhost.run',
    '127.0.0.1',
  ],
};

export default nextConfig;
