import { extendConfig } from '@builder.io/qwik-city/vite';
import baseConfig from '../../vite.config'; 
import inject from "@rollup/plugin-inject"
import { createRequire } from 'module'
import { fastlyAdapter } from './adapter';
import { UserConfigExport } from 'vite';
import fg from 'fast-glob'

const _staticPaths = `[${fg.sync('./dist/**').map(pth =>)}]`

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
                target: 'modules'
            },
            plugins: [
                fastlyAdapter(),
                inject({
                    Buffer: [ 'buffer', 'Buffer' ],
                    process: 'process',
                }),
                staticPaths()
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

export function staticPaths() {
    const virtualModuleId = 'virtual:static-paths'
    const resolvedVirtualModuleId = '\0' + virtualModuleId
  
    return {
      name: 'static-paths', 
      resolveId(id: string) {
        if (id === virtualModuleId) {
          return resolvedVirtualModuleId
        }
      },
      load(id: string) {
          if (id === resolvedVirtualModuleId) {
            const staticDir = "./dist"
            const _staticPaths = fg.sync(staticDir + "/**")
                .map(pth => `"${pth.replace(staticDir, "")}"`)
            return `export default [${_staticPaths.join(,)}]`
        }
      },
    }
  }