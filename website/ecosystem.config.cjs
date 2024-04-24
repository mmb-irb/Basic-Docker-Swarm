module.exports = {
  apps: [
    {
      name: 'nuxt-skeleton',
      port: '3001',
      exec_mode: 'cluster',
      instances: 'max',
      env: {
	      NODE_ENV: 'production'
      },
      script: './.output/server/index.mjs'
    }
  ]
}