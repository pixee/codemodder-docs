---
sidebar_position: 2
title: Project Setup
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This page walks through adding the right dependencies on your project. Create an empty project in either Maven or Gradle, then add our base dependency:

<Tabs>
<TabItem value="gradle-base" label="Gradle">

```kotlin
implementation("io.codemodder:codemodder-base:$VERSION")
```

</TabItem>
<TabItem value="mvn-base" label="Maven">

```xml
<dependency>
    <groupId>io.codemodder</groupId>
    <artifactId>codemodder-base</artifactId>
    <version>$VERSION</version>
</dependency>
```

</TabItem>
</Tabs>

## Decide how to find the code we want to change

Codemodder is designed to leverage common third-party tools to identify issues to fix. So, our next step is to choose which static analysis tool (if any) we'll use to _find_ the problem we want to fix. Some simple changes may not require anything more than the basic AST traversal features provided by JavaParser (which is in the base dependency). Other more complicated changes will require the use of third-party static analysis tools.

A good option for many use cases is to use [Semgrep](https://semgrep.dev) to find the code we want to change. This tool is excellent at finding different shapes of code, with tools for suppressing common false positives cases. Let's add the Semgrep plugin to our build so we can act on Semgrep findings.

<Tabs>
<TabItem value="gradle-semgrep" label="Gradle">

```kotlin
implementation("io.codemodder:codemodder-plugin-semgrep:$VERSION")
```

</TabItem>
<TabItem value="mvn-semgrep" label="Maven">

```xml
<dependency>
    <groupId>io.codemodder</groupId>
    <artifactId>codemodder-plugin-semgrep</artifactId>
    <version>$VERSION</version>
</dependency>
```

</TabItem>
</Tabs>

In order to test and run, you will have to install Semgrep as well:

```bash
$ pip install semgrep
```

With our setup done, our next step is to write the codemod!