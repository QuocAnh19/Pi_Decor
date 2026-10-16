module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // 1. Cấm import trực tiếp đường dẫn sâu nội bộ giữa các features khác nhau
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: [
              '**/features/*/*/**',
              '../features/*/*/**',
              '../../features/*/*/**',
              '../../../features/*/*/**',
              '../../../../features/*/*/**',
            ],
            message:
              'CẤM import trực tiếp vào file nội bộ của feature khác. Chỉ import qua barrel export (features/<ten>/index.ts hoặc features/<ten>).',
          },
        ],
      },
    ],

    // 2. Cảnh báo file vượt quá 300 dòng (warn)
    'max-lines': [
      'warn',
      {
        max: 300,
        skipBlankLines: true,
        skipComments: true,
      },
    ],

    // Cấm dùng any sau khi chuẩn hóa hệ thống mappers
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
