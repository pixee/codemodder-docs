---
sidebar_position: 1
slug: /
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Introduction

Codemodder is a pluggable framework for building expressive codemods. Previous codemod libraries allow for building cool stuff, but they were all missing key features that would allow more expressive and impactful code changes.

Codemodder offers:
* **Maximum expressiveness**. We allow you to use your favorite fancy static analysis tools to identify the code you want to change.
* **Storytelling as a first class feature**. Automating code changes isn't very helpful without the necessary communication to the other developers on your team.
* **The quietest changes possible**. There's some distance between "making a change" and "making a change that is easy to approve" and our framework guides you towards the latter.

Codemodder is a good framework to choose if your problem is one level more complex than linters can detect and fix, or require more or better storytelling because the issues they tackle are not straightforward (for instance, like advanced security issues.) Most of the feedback experienced developers give to junior developers fits into this bucket, but we offer many open source "core codemods" that solve the easy stuff too. 

# An example

The easiest codemod we can imagine writing is to replace all insecure (predictable) sources of randomness with secure (unpredictable) sources. Here we show what that codemod might look like across languages:

<Tabs>
  <TabItem value="example-java" label="Java" default>

```java
/** Turns {@link java.util.Random} into {@link java.security.SecureRandom}. */
@Codemod(
    id = "pixee:java/secure-random",
    reviewGuidance = ReviewGuidance.MERGE_WITHOUT_REVIEW)
public final class SecureRandomCodemod extends SarifPluginJavaParserChanger<ObjectCreationExpr> {

  private static final String DETECTION_RULE =
      """
      rules: 
        - id: secure-random 
          pattern: new Random()
      """;

  @Inject
  public SecureRandomCodemod(@SemgrepScan(yaml = DETECTION_RULE) RuleSarif sarif) {
    super(sarif, ObjectCreationExpr.class);
  }

  @Override
  public boolean onResultFound(
      final CodemodInvocationContext context,
      final CompilationUnit cu,
      final ObjectCreationExpr objectCreationExpr,
      final Result result) {
    objectCreationExpr.setType("SecureRandom");
    addImportIfMissing(cu, SecureRandom.class.getName());
    return true;
  }
}
```

You can see this code [live on GitHub](https://github.com/pixee/codemodder-java/blob/main/core-codemods/src/main/java/io/codemodder/codemods/SecureRandomCodemod.java).

This codemod, which would be easy to implement even without the need for a fancy static analysis tool, uses [Semgrep](https://semgrep.dev/) to find all the constructor calls for `java.util.Random`. These are the locations we want to change to `SecureRandom` instead.

The codemodder framework then hands off all those locations Semgrep found to the `onResultfound()` method, where the code just has to change the type and add the missing import. It takes care of a lot of annoying work -- the execution of static analysis tools, the parsing of its results, aligning the results to the code that handles them, the formatting of the resulting code, etc. All you specify is how to find the code to change and what change do you want to make. We handle the rest.

For more real-world examples, check out our [core Java codemods](https://github.com/pixee/codemodder-java/tree/main/core-codemods), which are codemods maintained by the framework and made for general use. We also provide utilities for building and testing these codemods to make the whole process seamless.

  </TabItem>
  <TabItem value="example-python" label="Python">

```python
class SecureRandom(SemgrepCodemod):
    NAME = "secure-random"
    REVIEW_GUIDANCE = ReviewGuidance.MERGE_WITHOUT_REVIEW
    DESCRIPTION = "Replaces random.{func} with more secure secrets library functions."

    @classmethod
    def rule(cls):
        return """
        rules:
          - patterns:
            - pattern: random.$F(...)
            - pattern-inside: |
                import random
                ...
        """

    def on_result_found(self, original_node, updated_node):
        self.remove_unused_import(original_node)
        self.add_needed_import("secrets")
        return self.update_call_target(updated_node, "secrets.SystemRandom()")
```

You can see this code [live on GitHub](https://github.com/pixee/codemodder-python/blob/main/codemodder/codemods/secure_random.py).

This codemod uses [Semgrep](https://semgrep.dev/) to detect cases where unsafe random methods are used. The codemod itself is implemented using the [libCST framework](https://github.com/Instagram/LibCST#readme).

For more real-world examples, check out our [core Python codemods](https://github.com/pixee/codemodder-python/tree/main/codemodder/codemods), which are codemods maintained by the framework and made for general use. We also provide utilities for building and testing codemods to make the whole process seamless. See the [Python codemodder repo](https://github.com/pixee/codemodder-python/) for more details.

⚠️ The Python codemodder API is still under heavy development and is subject to breaking changes. ⚠️

  </TabItem>
  <TabItem value="example-javascript" label="JavaScript">

```
Coming soon!
```

  </TabItem>
</Tabs>



### What languages does Codemodder support?
* Java
* JavaScript (coming soon)
* Python (coming soon)
