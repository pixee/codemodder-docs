---
sidebar_position: 5
title: Testing our first codemod
---

## Testing

If you want to write tests for your codemod (highly recommended, you're changing peoples' code!), you could add the test dependency. 

```
// could instead use any of the codeql, sonar, or pmd plugins
implementation("io.codemodder:codemodder-testutils:$VERSION")
```

This type adds a [mixin](https://en.wikipedia.org/wiki/Mixin) called [`CodemodTestMixin`](https://www.javadoc.io/doc/io.codemodder/codemodder-testutils/latest/io/codemodder/testutils/CodemodTestMixin.html).

This mixin reads annotation data from an empty JUnit test class and performs all the logic for validating the codemod based on convention. Here's the test for our