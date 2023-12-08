---
sidebar_position: 4
title: Building & Running Your Codemod
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

There are 3 steps for turning our codemod type into a runnable codemod artifact -- creating the CLI entry point, pointing to that entry point!

## Create the CLI Entry Point

Codemodder is a library for building codemod CLIs... so where is the CLI part? We need to create a small piece of code to actually invoke our codemods. Let's create a new type, `App.java`:

```java
package io.codemodder.sample;

import io.codemodder.Runner;

public final class App {
  public static void main(String[] args) {
    Runner.run(
      List.of(ReadLinesCodemod.class), // the codemods to run
      args // the arguments
    );  
  }
}
```

The [`Runner`](https://www.javadoc.io/doc/io.codemodder/codemodder-base/latest/io/codemodder/Runner.html) type will handle supporting all the supported [command line arguments](https://github.com/pixee/codemodder-specs/blob/main/cli.md), so you don't have to worry about any of that -- just point your `Main-Class` in your packaged `MANIFEST.MF` to `MyCodeRunner`, usually done with some code like this:

<Tabs>
<TabItem value="gradle-build" label="Gradle">

```kotlin
description = ""
val main = "io.codemodder.sample.App"
application {
    mainClass.set(main)
}
```

</TabItem>
<TabItem value="mvn-build" label="Maven">

```xml
<plugins>
    <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-jar-plugin</artifactId>
        <configuration>
            <archive>
                <manifest>
                    <mainClass>io.codemodder.sample.App</mainClass>
                </manifest>
            </archive>
        </configuration>
    </plugin>
</plugins>
```

</TabItem>
</Tabs>


## Running

It doesn't really matter if you created a Gradle distribution zip, or a fatjar with Maven -- your project has _some_ packaged up artifact. We can now invoke it with the standard CLI parameters and watch it work!

```bash
$ cd build/distributions/
$ unzip app.zip
$ app/bin/app /my-project-that-needs-updating 
```
