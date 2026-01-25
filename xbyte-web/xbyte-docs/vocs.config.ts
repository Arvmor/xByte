import { defineConfig } from 'vocs'

export default defineConfig({
  title: 'xByte',
  description: 'Infra for Pay-per-Byte Monetization',
  baseUrl: 'https://docs.xbyte.sh',
  
  iconUrl: '/img/logo-foreground.png',
  logoUrl: {
    light: '/img/logo.png',
    dark: '/img/logo-foreground.png'
  },
  
  font: {
    default: { google: 'Geist' },
    mono: { google: 'Geist Mono' }
  },  
  topNav: [
    { text: 'Documentation', link: '/getting-started', match: '/' },
    { text: 'Platform', link: 'https://xbyte.sh' }
  ],
  
  sidebar: [
    { text: 'Introduction', link: '/intro' },
    { text: 'Getting Started', link: '/getting-started' },
    { text: 'API Client', link: '/api-client' },
    { text: 'EVM Client', link: '/evm-client' },
    { text: 'Types', link: '/types' },
    { text: 'Examples', link: '/examples' }
  ],
  
  socials: [
    { icon: 'github', link: 'https://github.com/Arvmor/xbyte' }
  ],
  
  editLink: {
    pattern: 'https://github.com/Arvmor/xbyte/tree/main/xbyte-web/xbyte-docs/docs/pages/:path',
    text: 'Edit on GitHub'
  },
  
  markdown: {
    code: {
      themes: {
        light: 'github-light',
        dark: 'dracula'
      }
    }
  }
})
