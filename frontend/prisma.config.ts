import { defineConfig } from '@prisma/config';

export default defineConfig({
  earlyAccess: true,
  datasource: {
    url: 'file:./prisma/dev.db',
  },
});
