module.exports = {
  // Preset, transform, setup zoneless y coverage los aporta
  // @angular-builders/jest (jest-preset-angular). Aquí solo se añade el mapeo
  // de los alias de imports definidos en tsconfig.json.
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@layouts/(.*)$': '<rootDir>/src/layouts/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@env/(.*)$': '<rootDir>/src/environments/$1',
  },
};
