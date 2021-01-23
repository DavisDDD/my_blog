module.exports = {
  pathPrefix: "/my_blog",
  siteMetadata: {
    title: `Document by Code Bushi`,
    name: `Code Bushi`,
    siteUrl: `https://gatsby-theme-document.netlify.com`,
    description: `This is my description that will be used in the meta tags and important for search results`,
    social: [
      {
        name: `github`,
        url: `https://github.com/codebushi/gatsby-theme-document`
      },
      {
        name: `twitter`,
        url: `https://twitter.com/HuntaroSan`
      }
    ],
    sidebarConfig: {
      forcedNavOrder: ["/introduction", "/codeblock"],
      ignoreIndex: true
    }
  },
  plugins: [    
    {
      resolve: "gatsby-remark-embed-video",
      options: {
          width: 800,
          ratio: 1.77, 
          height: 400, 
          related: false,
          noIframeBorder: true
      },
  },
    { resolve: `gatsby-theme-document` }
  ]
};
