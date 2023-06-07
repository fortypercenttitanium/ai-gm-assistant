/** @type {import('vite').UserConfig} */
export default {
  build: {
    rollupOptions: {
      input: {
        main: './src/index.ts',
      },
      output: {
        entryFileNames: 'index.js',
      },
    },
  },
};
