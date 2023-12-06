---
sidebar_position: 3
title: Writing our first codemod
---

Now, let's write our first codemod! 

The newer methods in `java.nio.file.Files` replaced the need for some of community-loved APIs in `org.apache.commons.io.FileUtils`. So, let's write a codemod to move `org.apache.commons.io.FileUtils#readLines()` to `java.nio.file.Files.readAllLines()`.

## Step #1: Write the Semgrep

The first thing we need is some Semgrep to find all the invocations of `FileUtils#readLines()`. The [Semgrep Playground](https://semgrep.dev/playground/new) is a great place to iterate on new Semgrep queries. They have [plenty of docs](https://semgrep.dev/docs/) that we won't try to re-create here, so let's hand-wave a bit here and show you the finished product:

```yaml
rules:
  - id: migrate-files-commons-io-to-nio-read-file-to-lines
    pattern-either:
      - pattern: (org.apache.commons.io.FileUtils).readLines($X)
      - pattern: (org.apache.commons.io.FileUtils).readLines($X, (Charset $Y))
```

Let's note the ID: `migrate-files-commons-io-to-nio-read-file-to-lines`, we're gonna need that later!

### Step #2: Choose a type to implement

Here are some of the key types for creating a new codemod.

| Type                                            | Description                                                                         |
|-------------------------------------------------|-------------------------------------------------------------------------------------|
| io.codemodder.CodeChanger                       | The base `interface` for a codemod. Should rarely be implemented directly.          |
| io.codemodder.javaparser.JavaParserChanger      | A codemod that gets handed a fully-built JavaParser model of a source file.         |
| io.codemodder.javaparser.SarifJavaParserChanger | A codemod that reads SARIF results and acts on their matching JavaParser AST nodes. |

So -- what is SARIF? The [Static Analysis Results Interchange Format (SARIF)](https://sarifweb.azurewebsites.net/) is a JSON format that static analysis tools use to capture their results. You don't need to know too much (anything?) about SARIF -- but we're going to use `SarifJavaParserChanger` because that's the type that takes SARIF results from Semgrep and feeds them to JavaParser.

### Step #3: Code it up

Here's the code, and after it, we'll look at it piece by piece:
```java

```

#### The Class Definition

Let's look at the class definition and meet a few new concepts

```java
@Codemod(
    id = "pixee:java/migrate-files-commons-io-to-nio",
    reviewGuidance = ReviewGuidance.MERGE_WITHOUT_REVIEW)
public final class ReadLinesCodemod extends SarifPluginJavaParserChanger<MethodCallExpr> {
  ...
}
```

Each codemod needs a `@Codemod` annotation. This gives some necessary metadata for end users and will eventually feed a more robust CLI experience.

Second, notice the generic component of `SarifPluginJavaParserChanger`. This generic tells our framework that Semgrep query to return the locations of Java method call expressions. If the SARIF points to any locations that don't point to a method call, the callback won't occur.

Let's see the implemented callback!

```java
@Override
public boolean onResultFound(
    CodemodInvocationContext context,
    CompilationUnit cu,
    MethodCallExpr apacheReadLinesCall, // this type is set by the generic
    Result result) {
  NodeList<Expression> arguments = apacheReadLinesCall.getArguments(); // get the arguments for the method call
  MethodCallExpr toPath = new MethodCallExpr(arguments.get(0), "toPath"); // change to the new API which requires a Path
  arguments.set(0, toPath);
  boolean success =
      replace(apacheReadLinesCall)
          .withStaticMethod("java.nio.file.Files", "readAllLines")
          .withSameArguments();

  if (success) {
    removeImportIfUnused(cu, "org.apache.commons.io.FileUtils");
  }

  return success; // should return true if a change was made, so it can be communicated to the user (if they care)
}
```

