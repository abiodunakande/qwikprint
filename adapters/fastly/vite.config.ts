import { extendConfig } from '@builder.io/qwik-city/vite';
import baseConfig from '../../vite.config'; 
import inject from "@rollup/plugin-inject"
import { createRequire } from 'module'
import { fastlyAdapter } from './adapter';
import { UserConfigExport } from 'vite';

const require = createRequire(import.meta.url)

export default extendConfig(
    baseConfig,
    <UserConfigExport>(async () => {
        return {
            build: {
                ssr: true,
                rollupOptions: {
                    input: ['src/entry.fastly.tsx', '@qwik-city-plan'],
                },
            },
            plugins: [
                fastlyAdapter(),
                inject({
                    Buffer: [ 'buffer', 'Buffer' ],
                    process: 'process',
                })
            ],
            resolve: {
                fallback: {
                    'buffer': require.resolve('buffer/'),
                    'process': require.resolve('process/browser'),
                    'stream': require.resolve('stream-browserify'),
                }
            },
        };
    })
);
