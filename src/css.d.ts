// Lets TypeScript accept CSS side-effect imports (e.g. `import '@/global.css'`).
// The Metro/Expo bundler handles these at runtime; this just silences tsc.
declare module '*.css';
