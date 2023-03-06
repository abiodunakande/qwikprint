import type {
    ServerRenderOptions,
    ServerRequestEvent,
  } from '@builder.io/qwik-city/middleware/request-handler';
import {
    mergeHeadersCookies,
    requestHandler,
} from '@builder.io/qwik-city/middleware/request-handler';
import { _deserializeData, _serializeData, _verifySerializable } from '@builder.io/qwik';
import { setServerPlatform } from '@builder.io/qwik/server';
import { TextEncoderStream } from "@stardazed/streams-text-encoding";

import staticPaths  from 'virtual:static-paths'

// @builder.io/qwik-city/middleware/fastly

/**
 * @alpha
 */
export function createQwikCity(opts: QwikCityFastlyOptions) {
    (globalThis as any).TextEncoderStream = TextEncoderStream;
    const qwikSerializer = {
      _deserializeData,
      _serializeData,
      _verifySerializable,
    };
    if (opts.manifest) {
      setServerPlatform(opts.manifest);
    }
    async function onFastlyRequest(request: Request) {
        try {
            const url = new URL(request.url);  
            if (isStaticPath(request.method, url)) {
                return fetch();
              }
            const serverRequestEv: ServerRequestEvent<Response> = {
            mode: 'server',
            locale: undefined,
            url,
            request,
            env: {
                get(key) {
                return process.env[key];
                },
            },
            getWritableStream: (status, headers, cookies, resolve) => {
                const { readable, writable } = new TransformStream();
                const response = new Response(readable, {
                status,
                headers: mergeHeadersCookies(headers, cookies),
                });
                resolve(response);
                return writable;
            },
            platform: {},
            };
    
            // send request to qwik city request handler
            const handledResponse = await requestHandler(serverRequestEv, opts, qwikSerializer);
            if (handledResponse) {
            handledResponse.completion.then((v) => {
                if (v) {
                console.error(v);
                }
            });
                const response = await handledResponse.response;
                if (response) {
                return response;
            }
            }
      } catch (e: any) {
            console.error(e);
            return new Response(String(e || 'Error'), {
            status: 500,
            headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Error': 'fastly-compute' },
            });
      }
    }
  
    return onFastlyRequest;
}

  
/**
 * @alpha
 */
export interface QwikCityFastlyOptions extends ServerRenderOptions {}

/**
 * @alpha
 */
export interface PlatformFastly {}