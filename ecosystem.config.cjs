module.exports = {
    apps: [
        {
            name: 'farmacia-api',
            script: './index.js',
            cwd: './server',
            exec_mode: 'fork',
            instances: 1,
            autorestart: true,
            watch: true,
            watch_delay: 1000,
            ignore_watch: [
                'node_modules',
                'logs',
                '*.log',
                '.env'
            ],
            max_memory_restart: '300M',
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
                watch: false
            },
            error_file: './server/logs/err.log',
            out_file: './server/logs/out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
        }
    ]
};
