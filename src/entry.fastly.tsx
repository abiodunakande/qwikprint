/// <reference types="@fastly/js-compute" />
import { createQwikCity, type PlatformFastly } from "../middleware/fastly" 
import qwikCityPlan from '@qwik-city-plan';
import { manifest } from '@qwik-client-manifest';
import render from './entry.ssr';
declare global {
    interface QwikCityPlatform extends PlatformFastly {}
}

const qwikHandler = createQwikCity({ render, qwikCityPlan, manifest });

async function handler(event) { 
    const response = await qwikHandler(event.request)
    console.log(response)
    return response
}

addEventListener('fetch', (event: any) => event.respondWith(handler(event.request)));
