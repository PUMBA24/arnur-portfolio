import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const withMDX = createMDX({ extension: /\.mdx?$/ });
const config: NextConfig = {
  output: 'export',
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  images: { unoptimized: true },
  poweredByHeader: false,
};
export default withMDX(config);
