// packages/qwik-city/adapters/express/vite/index.ts
import { ServerAdapterOptions, viteAdapter } from "@builder.io/qwik-city/adapters/shared/vite";
export interface FastlyAdapterOptions extends ServerAdapterOptions { 
}
function fastlyAdapter(opts: FastlyAdapterOptions = {}) {
  return viteAdapter({
    name: "fastly",
    origin: process.env.URL || "http://127.0.0.1:7676",
    ssg: opts.ssg,
    cleanStaticGenerated: true,
    config() {
      return {
        ssr: {
            target: "webworker",
            noExternal: true,
        },
        build: {
          ssr: true
        },
        publicDir: false
      };
    }
  });
}

const fastlyAdaptor = fastlyAdapter;
export {
  fastlyAdapter,
  fastlyAdaptor
};

