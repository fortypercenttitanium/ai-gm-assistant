/** @type {import('vite').UserConfig} */
export default {
  build: {
    rollupOptions: {
      input: {
        main: './src/index.js',
      },
      output: {
        entryFileNames: 'index.js',
      },
    },
  },
};
