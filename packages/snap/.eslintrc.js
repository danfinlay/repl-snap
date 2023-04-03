module.exports = {
  extends: ['../../.eslintrc.js'],
  globals: {
    Compartment: 'writable',
  },
  rules: {
    'new-cap': [
      'error',
      {
        capIsNewExceptions: ['Compartment'],
    }],
  },
  ignorePatterns: ['!.eslintrc.js', 'dist/'],
};
