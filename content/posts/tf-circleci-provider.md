---
title: "A Terraform Provider for CircleCI"
date: 2020-06-30
draft: false
slug: tf-circleci-provider
city: Birmingham
toc: true
tags: [terraform, terraform-provider, ci-cd]
---

This is a test blog post, pulled from notion.

```javascript
resource "circleci_project" "example" {
    name     = "MyCircleProject"
    env_vars {
      SOME_VARIABLE = "MyVariableValue"
    }
}

```
