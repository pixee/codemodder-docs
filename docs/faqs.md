---
sidebar_position: 4
---

# FAQs

### Can you help me make a codemod?

Yes! We're passionate about this and would love to help. Join the Pixee community [on Slack!](https://join.slack.com/t/openpixee/shared_invite/zt-1pnk7jqdd-kfwilrfG7Ov4M8rorfOnUA)

### How does codemodder compare to jscodeshift/JavaParser/Semgrep/libcst?

codemodder is a collection of language-specific frameworks for building codemods. Other tools are really good at searching code for patterns (like Semgrep or PMD), or mutating code (like jscodeshift or JavaParser.) The purpose of codemodder is to make it very easy orchestrate these tools together to quickly build powerful codemods. Many tools could be used in orchestration of a codemodder codemod.

### How does codemodder compare to OpenRewrite?

At a high level, we are both codemod development tools (except they call them "recipes"). There are multiple differences in the technical approach between [OpenRewrite](https://github.com/openrewrite/) and codemodder. While we appreciate their work on building a complete stack for codemod development, we're focused on orchestration of idiomatic community tools and integration with other tools.

### How does codemodder relate to Pixeebot?

The team behind [Pixeebot](https://pixee.ai/) delivers code improvements using codemodder-based codemods and sponsors the development of codemodder.

### How can I make codemods for language X|Y|Z?

All of the specifications for creating a codemodder framework for your language are [available here](https://github.com/pixee/codemodder-specs). This is a heavy lift, but we'd love to support you.
