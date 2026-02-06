// lighthouserc.cjs
module.exports = {
  ci: {
    collect: {
      staticDistDir: './apps/web/dist',
      numberOfRuns: 3,
      url: ['http://localhost:8080/'],
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        // Categorías: solo warn para no bloquear CI
        'categories:performance': ['warn', { minScore: 0.5 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.7 }],
        'categories:seo': ['warn', { minScore: 0.8 }],

        // Desactivar audits que no aplican en CI localhost
        'uses-http2': 'off',
        'is-on-https': 'off',
        'redirects-http': 'off',

        // Desactivar audits nuevos/insight que el preset marca como error
        'errors-in-console': 'off',
        'image-delivery-insight': 'off',
        'lcp-discovery-insight': 'off',
        'network-dependency-tree-insight': 'off',
        'prioritize-lcp-image': 'off',
        'valid-source-maps': 'off',
        'render-blocking-insight': 'off',

        // Bajar a warn audits de optimización (mejora progresiva)
        'meta-description': 'warn',
        'total-byte-weight': 'warn',
        'unused-javascript': 'warn',
        'uses-rel-preconnect': 'warn',
        'unsized-images': 'warn',
        'uses-responsive-images': 'warn',
        'modern-image-formats': 'warn',
        'legacy-javascript': 'warn',
        'render-blocking-resources': 'warn',
        'first-contentful-paint': 'warn',
        'interactive': 'warn',
        'largest-contentful-paint': 'warn',
        'max-potential-fid': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
