/**
 * Single import point for the rest of the app. Switches transparently
 * between the real backend client and the local mock based on the env flag.
 * Components should only ever import from here, never from client.js or
 * mockClient.js directly.
 */
import { authApi as realAuthApi, generationApi as realGenerationApi, tokenStore } from './client'
import { mockAuthApi, mockGenerationApi } from './mockClient'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'

export const authApi = USE_MOCK ? mockAuthApi : realAuthApi
export const generationApi = USE_MOCK ? mockGenerationApi : realGenerationApi
export { tokenStore, USE_MOCK }
