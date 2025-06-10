// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // Falls du den app Router doch nutzt: './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ...
    },
  },
  plugins: [    
    require('@tailwindcss/typography'), 
    require('@tailwindcss/aspect-ratio'), 
  ],
}
export default config