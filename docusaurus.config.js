// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Codemodder',
  tagline: 'The best codemods',
  url: 'https://codemodder.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'pixee', // Usually your GitHub org/user name.
  projectName: 'internal-codemodder-docs', // Usually your repo name.
  deploymentBranch: 'main',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  stylesheets: [
    'https://fonts.googleapis.com/css?family=Source+Sans+Pro:200,200i,300,300i,400,400i,600,600i,700,700i,900,900i&display=swap',
  ],

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/pixee/codemodder-docs/edit/main/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/pixee/codemodder-docs/edit/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        gtag: {
          trackingID: 'G-PP500P3417',
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        logo: {
          alt: 'Codemodder',
          src: 'img/CodemodderLM.png',
          srcDark: 'img/CodemodderDM.png',
        },

        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Home',
          },
          {
            type: 'html',
            position: 'right',
            value:
              '<a href="https://github.com/pixee/codemodder-docs" target="_blank"><div class="header-github-link"></div><a/>',
          },
          {
            type: 'html',
            position: 'right',
            value:
              '<a href="https://join.slack.com/t/openpixee/shared_invite/zt-1pnk7jqdd-kfwilrfG7Ov4M8rorfOnUA" target="_blank",><div class="header-slack-link"></div><a/>',
          },
        ],
      },
      head: [],
      footer: {
        links: [
          {
            items: [
              {
                html: `
                <div class="footerContent">
                  <div class="copyright"><span>© 2023 Pixee Inc.</span> All rights reserved</div>
                  <div class="socialIcons">
                  <a href="https://twitter.com/pixeebot" target="_blank"><div class="footer-twitter-link"></div></a>
                  <a href="https://www.linkedin.com/company/pixee/" target="_blank"><div class="footer-linkedin-link"></div></a>
                  </div>

                  <div class="links">
                    <a href="https://www.pixee.ai/terms" target="_blank">Terms of Service</a>
                    <a href="https://www.pixee.ai/privacy" target="_blank">Privacy Policy</a>
                    <a href = "mailto: hi@pixee.ai">Contact us</a>
                  </div>
                </div>
                  `,
              },
            ],
          },
        ],
      },
      prism: {
        additionalLanguages: ['java', 'python'],
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),

  scripts: [
    {
      src: '/js/loadtags.js',
      async: true,
    },
    {
      src: '/js/handle_double_slash.js',
      async: true,
    },
  ],
};

module.exports = config;
