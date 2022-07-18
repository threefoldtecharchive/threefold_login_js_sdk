/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.spec.json',

    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    "^.+\\.(js|jsx)$": "babel-jest"

  },
  testEnvironment: 'node',
  "transformIgnorePatterns": [
    "node_modules/(?!@jimber/.*)",


  ]

};
