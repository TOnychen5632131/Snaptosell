import withNextIntl from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "thrzcfioglsexmxfcnfv.supabase.co",
        pathname: "/storage/v1/object/public/**"
      }
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ["@supabase/supabase-js"]
  }
};

export default withNextIntl(nextConfig);