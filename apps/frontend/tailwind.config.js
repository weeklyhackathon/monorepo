/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // For headers
        mek: ['MEKSans', 'sans-serif'],
        // For default text (though this is optional since we set it in CSS)
        mono: ['IBM Plex Mono', 'monospace']
      }
    }
  },
  plugins: []
};
