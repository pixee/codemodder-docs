---
sidebar_position: 3
title: Writing our First Codemod
---

Now, let's write our first codemod! 

The newer methods in `java.nio.file.Files` removed the need for some community-provided APIs in `org.apache.commons.io.FileUtils`. So, let's write a codemod to move `org.apache.commons.io.FileUtils#readLines()` to `java.nio.file.Files.readAllLines()`. The diffs should look something like this:

```diff
- import org.apache.commons.io.FileUtils; // remove the import if possible
+ import java.nio.file.Files;

...

- List<String> lines = FilesUtils.readLines(file);
+ List<String> lines = Files.readAllLines(file.toPath());
```

## Step #1: Write the Semgrep to find the calls we want to change

The first thing we need is a Semgrep query to find all the invocations of `FileUtils#readLines()`. The [Semgrep Playground](https://semgrep.dev/playground/new) is a great place to iterate on new Semgrep queries. They have [plenty of docs](https://semgrep.dev/docs/) that we won't try to re-create here, so let's just show you the finished product:

```yaml
rules:
  - id: migrate-files-commons-io-to-nio-read-file-to-lines
    pattern-either:
      - pattern: (org.apache.commons.io.FileUtils).readLines($X)
      - pattern: (org.apache.commons.io.FileUtils).readLines($X, (Charset $Y))
```

## Step #2: Choose a type to implement

Here are some of the key types for creating a new codemod.

| Type                                            | Description                                                                         |
|-------------------------------------------------|-------------------------------------------------------------------------------------|
| io.codemodder.CodeChanger                       | The base `interface` for a codemod. Should rarely be implemented directly.          |
| io.codemodder.javaparser.JavaParserChanger      | A codemod that gets handed a fully-built JavaParser model of a source file.         |
| io.codemodder.javaparser.SarifJavaParserChanger | A codemod that reads SARIF results and acts on their matching JavaParser AST nodes. |

So -- what is SARIF? The [Static Analysis Results Interchange Format (SARIF)](https://sarifweb.azurewebsites.net/) is a JSON format that static analysis tools use to capture their results. You don't need to know too much (anything?) about SARIF -- but we're going to use `SarifJavaParserChanger` because that's the type that takes SARIF results from Semgrep and feeds them to JavaParser.

## Step #3: Code it up

We're going to step through the codemod from the top to the bottom, piece by piece, then show you the whole thing.

### The Class Definition

Let's look at the class definition and meet a few new concepts

```java
@Codemod(
    id = "pixee:java/migrate-files-commons-io-to-nio",
    reviewGuidance = ReviewGuidance.MERGE_WITHOUT_REVIEW)
public final class ReadLinesCodemod extends SarifPluginJavaParserChanger<MethodCallExpr> {
  ...
}
```

First, each codemod needs a `@Codemod` annotation. This gives some necessary metadata for end users and will eventually feed a more robust CLI experience.

Second, notice the generic component of `SarifPluginJavaParserChanger`. This generic tells our framework that the Semgrep query returns the locations of Java method call expressions. If the SARIF points to a location that doesn't point to a method call, the callback won't execute. Let's see how to inject the Semgrep SARIF into the type.

### The Injection

We use Guice to inject stuff into codemods, so they don't have to worry about how to create them. 

```java

private static final String RULE =
        """
        rules:
          - id: migrate-files-commons-io-to-nio-read-file-to-lines
            pattern-either:
              - pattern: (org.apache.commons.io.FileUtils).readLines($X)
              - pattern: (org.apache.commons.io.FileUtils).readLines($X, (Charset $Y))
        """;
        
@Inject // tell Guice to inject stuff here
public ReadLinesCodemod(
  @SemgrepScan(yaml = RULE) final RuleSarif sarif // asks for callbacks for hits on the given Semgrep rule
) {
  super(
    sarif, // give it the SARIF that will be used to find hits
    MethodCallExpr.class, // only look for method calls that match the SARIF
    CodemodReporterStrategy.fromClasspath(ReadLinesCodemod.class) // pull storytelling text from classpath resource
  );
}
```

Now, if we were use another static analysis tool like PMD, we would add the `codemodder-plugin-pmd` dependency and instead use the `@PmdScan` annotation.

### The Callback

Let's see the implemented callback, starting with the declaration:

```java
@Override
public boolean onResultFound(
    CodemodInvocationContext context, // some context, like the file path, configuration, etc.
    CompilationUnit cu, // the JavaParser model of this source file source
    MethodCallExpr apacheReadLinesCall, // the method call AST node that was found by Semgrep in our query
    Result result // the SARIF result for this particular finding
  ) {
```

Here's the code change we want to make again:

```diff
- List<String> lines = FilesUtils.readLines(file);
+ List<String> lines = Files.readAllLines(file.toPath());
```

Notice we need to not only change the static method being invoked, but we also have to translate the first argument to be a `Path`. Here's the code we'll use to do that:

```java
NodeList<Expression> arguments = apacheReadLinesCall.getArguments(); // get the arguments for the call
MethodCallExpr toPath = new MethodCallExpr(arguments.get(0), "toPath"); // call toPath() on the first arg) 
arguments.set(0, toPath);
```

Next we use a convenience utility we created,  [`replace(Node)`](https://www.javadoc.io/doc/io.codemodder/codemodder-base/latest/io/codemodder/javaparser/JavaParserTransformer.html), to help us replace the call with the new version:
```java
  boolean success =
      replace(apacheReadLinesCall)
          .withStaticMethod("java.nio.file.Files", "readAllLines")
          .withSameArguments();
```

If the replacing was successful, we'll remove the import if we can't find any references to it.

```java
  if (success) {
    removeImportIfUnused(cu, "org.apache.commons.io.FileUtils"); // won't remove if it's still needed
  }
  return success; // should return true if a change was made, so it can be communicated to the user
```

We're done! Here's the whole codemod:

```java
@Codemod(
    id = "pixee:java/migrate-files-commons-io-to-nio",
    reviewGuidance = ReviewGuidance.MERGE_WITHOUT_REVIEW)
public final class ReadLinesCodemod extends SarifPluginJavaParserChanger<MethodCallExpr> {

    private static final String RULE =
        """
        rules:
          - id: migrate-files-commons-io-to-nio-read-file-to-lines
            pattern-either:
              - pattern: (org.apache.commons.io.FileUtils).readLines($X)
              - pattern: (org.apache.commons.io.FileUtils).readLines($X, (Charset $Y))
        """;

  public ReadLinesCodemod(@SemgrepScan(yaml = RULE) final RuleSarif sarif) {
     super(
        sarif, // give it the SARIF that will be used to find hits
        MethodCallExpr.class, // only look for method calls that match the SARIF
        CodemodReporterStrategy.fromClasspath(ReadLinesCodemod.class) // pull storytelling text from classpath resource
     );
  }

  @Override
  public boolean onResultFound(
        final CodemodInvocationContext context,
        final CompilationUnit cu,
        final MethodCallExpr apacheReadLinesCall,
        final Result result) {
    NodeList<Expression> arguments = apacheReadLinesCall.getArguments();
    MethodCallExpr toPath = new MethodCallExpr(arguments.get(0), "toPath");
    arguments.set(0, toPath);
    boolean success =
        replace(apacheReadLinesCall)
            .withStaticMethod("java.nio.file.Files", "readAllLines")
            .withSameArguments();
    
    if (success) {
      removeImportIfUnused(cu, "org.apache.commons.io.FileUtils");
    }
    
    return success;
  }
}
```

## Step #3: Add the storytelling

Well, we lied a little. We wrote all the _code_, but one of the philosophies of codemodder is that we need to tell a good story about the changes we make. Without good storytelling, people won't know the purpose or value of the changes being made.

### Provide Storytelling From the Classpath (Recommended)
We provide a shortcut for folks who don't want to write and maintain big blocks of text in a Java file (like us). You can provide a [CodemodReporterStrategy](https://www.javadoc.io/doc/io.codemodder/codemodder-base/latest/io/codemodder/CodemodReporterStrategy.html) that builds reports based on text from a well-defined location on the classpath. This is an alternative to storing data inline to the Java source code of your codemod. It's easier to maintain this "data" outside of code, so we prefer a simple mechanism for doing that. Both the files read are expected to be in `/com/acme/MyCodemod/` (assuming that's the name of your codemod type).
 
The first expected file in that directory is `{@code report.json}`. It contains most of the fields we want to report:

```json
{
  "summary": "A headline describing the changes provided by this codemod",
  "change": "A description of the change suitable for a particular instance of a change",
  "references": [
    "A URL for further reading",
    "Another URL for further reading"
  ]
}
```

The second file is `description.md`, and it provides a description of the codemod's purpose and an exploration of the changes it makes. It's expected to contain more verbose text, so it is stored in a separate file where it can be easily edited with an IDE supporting markdown.

Thus, in a typical Java project, using this `CodemodReporterStrategy` would mean your artifact would include at least these 3 files:

 - src/main/java/com/acme/MyCodemod.java
 - src/main/resources/com/acme/MyCodemod/report.json
 - src/main/resources/com/acme/MyCodemod/description.md


### Provide Storytelling In The Codemod
Alternatively, if you have very simple storytelling, you can directly implement the following methods in your codemod:

```java
@Override
public String getSummary() { return "Fixes Acme thing..."; }

@Override
public String getDescription() { return "This change ..."; }

@Override
public List<String> getReferences() { return List.of("https://internal.acme.com/use-x-instead-of-y"); }
```

### Skip Storytelling
If you don't care about storytelling, you can just use `CodemodReporterStrategy.empty()`.

## Back to our example

For our codemod, we'll choose the classpath reporter strategy, so we're going to add those two files:

Here's `src/main/resources/io/codemodder/sample/ReadLinesCodemod/report.json`:
```json
{
  "summary": "Modernize Apache Commons IO Files API to Java NIO",
  "change": "Modernized Apache Commons IO Files#readLines() to use Java NIO Files#readAllLines()",
  "references": [
    "https://docs.oracle.com/javase/8/docs/api/java/nio/file/Files.html#readAllLines-java.nio.file.Path-"
  ]
}
```

Here's `src/main/resources/io/codemodder/sample/ReadLinesCodemod/description.md`:
```
This change modernizes an Apache Commons IO method to use Java NIO alternatives instead.

We prefer to use `java.nio` libraries instead of 3rd party to reduce our dependencies.

This change in particular translates Apache Commons IO `FileUtils#readLines()` to use Java NIO's `Files#readAllLines()`.
```

## Done!

Ok, now we're actually done. Now let's build and run this thing!