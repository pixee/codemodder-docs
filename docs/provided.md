---
sidebar_position: 3
title: Provided Codemods 
---

You may see the term "Provided Codemod" in our documentation and in our code. This page discusses what differentiates "provided" codemods from more typical codemods.

## It's about how we find the code

Provided codemods are a special type of codemod that are fed location information from an offline, external, previously-run program. We call them "provided" codemods because some external party is "providing" the context on where to make the desired  code changes. We currently support accepting context from the following tools:

* Sonar
* CodeQL
* Semgrep

If you want to make a codemod for fixing something these tools find, please look at the documentation for the codemodder project for your language. 

## Let's support more!

Note that these are the "built in" providers we support and for which we offer easy-to-implement supertypes. We'd be interested in fixing the stuff your favorite tool finds -- just open an issue on the codemodder framework GitHub page ([Java](https://github.com/pixee/codemodder-java/issues), [Python](https://github.com/pixee/codemodder-python/issues)).