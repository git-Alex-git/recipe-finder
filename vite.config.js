import { defineConfig } from 'vite'

export default defineConfig({
    root: './front',
    server: {
        proxy: {
            '/ingredients': 'http://localhost:3000',
            '/recipes': 'http://localhost:3000'
        }
    }
})
