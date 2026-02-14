module.exports = {
  apps: [{
    name: 'embroidize-frontend',
    script: './.next/standalone/server.js',
    cwd: '/var/www/embroidize-frontend',
    instances: 2, // Run 2 instances (adjust based on your CPU cores)
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    max_memory_restart: '500M',
    min_uptime: '10s',
    max_restarts: 10,
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', '.next/cache'],
    error_file: '/var/log/pm2/embroidize-frontend-error.log',
    out_file: '/var/log/pm2/embroidize-frontend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    wait_ready: true,
    listen_timeout: 10000,
    kill_timeout: 5000
  }]
};
