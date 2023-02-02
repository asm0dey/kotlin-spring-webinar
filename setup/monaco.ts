import { defineMonacoSetup } from '@slidev/types'

export default defineMonacoSetup(() => {
    return {
        theme: {
            dark: 'vs-dark',
            light: 'vs',
        },
    }
})