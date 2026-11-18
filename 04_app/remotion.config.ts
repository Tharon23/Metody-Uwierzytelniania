import { Config } from '@remotion/cli/config';
import path from 'node:path';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(6);
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: { ...(config.resolve?.alias ?? {}), '@content': path.resolve(process.cwd(), '../03_content/data') },
  },
}));
