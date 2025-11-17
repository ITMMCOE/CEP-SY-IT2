/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Disable server components warnings for transformers
  experimental: {
    serverComponentsExternalPackages: ['@xenova/transformers', 'sharp', 'onnxruntime-node'],
  },
  
  webpack: (config, { isServer, webpack }) => {
    // Add path alias resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };
    
    // Ignore .node files entirely
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.node$/,
      use: 'ignore-loader',
    });
    
    if (!isServer) {
      // CRITICAL: Replace onnxruntime-node with empty module
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^onnxruntime-node$/,
          (resource) => {
            resource.request = 'data:text/javascript,export default {};';
          }
        )
      );
      
      // Also replace sharp
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^sharp$/,
          (resource) => {
            resource.request = 'data:text/javascript,export default {};';
          }
        )
      );
      
      // Client-side: replace problematic modules entirely
      config.resolve.alias = {
        ...config.resolve.alias,
        'onnxruntime-node': false,
        'sharp': false,
        'onnx': false,
      };
      
      // Ignore these patterns completely
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^onnxruntime-node$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^sharp$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /\.node$/,
        })
      );
      
      // Add fallbacks for Node.js built-ins
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'fs': false,
        'path': false,
        'worker_threads': false,
        'perf_hooks': false,
        'os': false,
        'crypto': false,
        'module': false,
        'url': false,
      };
      
      // Inject global to prevent onnxruntime-node detection
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.versions.node': JSON.stringify(undefined),
        })
      );
    } else {
      // Server-side: also exclude
      config.resolve.alias = {
        ...config.resolve.alias,
        'onnxruntime-node': false,
        'sharp': false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
