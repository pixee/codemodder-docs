---
sidebar_position: 5
title: Testing Your Codemod 
---

## Testing

If you want to write tests for your codemod (highly recommended, you're changing peoples' code!), let's show how.

First, we add the test dependency. 

```
// could instead use any of the codeql, sonar, or pmd plugins
implementation("io.codemodder:codemodder-testutils:$VERSION")
```

This type adds a [mixin](https://en.wikipedia.org/wiki/Mixin) called [`CodemodTestMixin`](https://www.javadoc.io/doc/io.codemodder/codemodder-testutils/latest/io/codemodder/testutils/CodemodTestMixin.html).

This mixin reads annotation data from a JUnit test class and performs all the logic for validating the codemod based on convention. It provides the two basic following features:

* verification of expected code changes
* verification of dependencies injected (if any)

Here's the test for our `ReadLinesCodemod`:

```java
@Metadata(
    codemodType = ReadLinesCodemod.class,
    testResourceDir = "readlines",
    dependencies = {})
final class ReadLinesCodemodTest implements CodemodTestMixin {}
```

That's it! Now, there's some convention to explain.

This mixin expects a directory called `readlines` in the test classpath (e.g., `src/test/resources/readlines`). This directory can have multiple file pairs that follow a name pattern like `ArbitraryTestName.java.before` and `ArbitraryTestName.java.after`. For each of these pairs, the codemod will be run on the `.before` file, and the output should match the `.after` file. These files end up being your test cases, and should be thorough.

You can also specify if you expect a codemod to be injected a dependency into the project manifest when a change is made.


