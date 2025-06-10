/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/random/**',
      },
      { // NEUER EINTRAG für Wikimedia Commons
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/wikipedia/commons/**', // Erlaubt Bilder aus dem /commons/ Unterverzeichnis
      },
      // Hier kannst du weitere erlaubte Hostnames hinzufügen
    ],
  },
};

module.exports = nextConfig;