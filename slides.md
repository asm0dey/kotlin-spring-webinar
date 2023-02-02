---
# try also 'default' to start simple
theme: apple-basic
# random apple-basic from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
# apply any windi css classes to the current slide
# class: 'text-center'
# https://sli.dev/custom/highlighters.html
background: https://source.unsplash.com/collection/94734566/1920x1080
# show line numbers in code blocks
lineNumbers: true
# persist drawings in exports and build
drawings:
  persist: false
colorSchema: 'dark'
layout: intro
highlighter: prism
canvasWidth: 800
monaco: true
---

#  Advanced Kotlin Techniques for Spring Developers

---
layout: image-right
image: 'avatar.jpg'
---
# `whoami`

<v-clicks>

- <div v-after>Pasha Finkelshteyn</div>
- Dev <noto-v1-avocado /> at <logos-jetbrains />
- ≈10 years in JVM. Mostly <logos-java /> and <logos-kotlin-icon />
- And <logos-spring-icon />
- <logos-twitter /> asm0di0
- <logos-mastodon-icon /> @asm0dey@fosstodon.org

</v-clicks>

---
layout: statement
---

# That's what I learned

---

# Where do I start?

https://start.spring.io

![](/settings.png)

---

# Minimum dependencies

<img src="/deps.png" class="max-h-310px"/>

[Full config](https://start.spring.io/#!type=gradle-project-kotlin&language=kotlin&platformVersion=3.0.2&packaging=jar&jvmVersion=17&groupId=com.github.asm0dey&artifactId=sample&name=sample&description=Demo%20project%20for%20Spring%20Boot&packageName=com.github.asm0dey.sample&dependencies=data-jpa,postgresql,validation,web,security,testcontainers)


---
layout: section
---

# `build.gradle.kts`

---

# What happens

```kotlin {all|4|5|6-8|19|22-25|26-29|30-33|38|42|42,44} {maxHeight:'360px'}
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
	id("org.springframework.boot") version "3.0.2"
	id("io.spring.dependency-management") version "1.1.0"
	kotlin("jvm") version "1.7.22"
	kotlin("plugin.spring") version "1.7.22"
	kotlin("plugin.jpa") version "1.7.22"
}

group = "com.github.asm0dey"
version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_17

repositories {
	mavenCentral()
}

extra["testcontainersVersion"] = "1.17.6"

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
	runtimeOnly("org.postgresql:postgresql")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.springframework.security:spring-security-test")
	testImplementation("org.testcontainers:junit-jupiter")
	testImplementation("org.testcontainers:postgresql")
}

dependencyManagement {
	imports {
		mavenBom("org.testcontainers:testcontainers-bom:${property("testcontainersVersion")}")
	}
}

tasks.withType<KotlinCompile> {
	kotlinOptions {
		freeCompilerArgs = listOf("-Xjsr305=strict")
		jvmTarget = "17"
	}
}

tasks.withType<Test> {
	useJUnitPlatform()
}
```

---
layout: section
---

# The only generated class

---

# Main class

```kotlin {all|6,7|10}
package com.github.asm0dey.springkotlinstart

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class SpringKotlinStartApplication

fun main(args: Array<String>) {
	runApplication<SpringKotlinStartApplication>(*args)
}
```

---
canvasWidth: 600
---

# `runApplication`

```kotlin
inline fun <reified T : Any> runApplication(vararg args: String): ConfigurableApplicationContext =
		SpringApplication.run(T::class.java, *args)
```

1. `inline` ← function will be inlined into the caller body
1. `reified T: Any` ← reified generics!

---

# Reified generics

In Java Kotlin's reified generics could be emulated like this:

```java
public <T> ConfigurableApplicationContext runApplication(clazz: Class<T>, String... args){
  SpringApplication.run(clazz, args)
}
```

---
layout: statement
---

# Now let's try something real

## MVC + Validation

---

# First controller

```kotlin {all|2|4|5}
@RestController
@RequestMapping("/person")
class PersonController {
  @PostMapping
  fun createPerson(@RequestBody @Valid person: Person) {}
}
```

<v-click>

`Person.kt`:
```kotlin
data class Person(
    val name: String,
    val age: Double
)
```

</v-click>

---

# Make an empty `POST`…

```http {all|1|2}
POST localhost:8080/person
Content-Type: application/json
```

<v-click>

```http {all|5-7}
HTTP/1.1 400 
Content-Type: application/json
{
  "timestamp": 1674735741056,
  "status": 400,
  "error": "Bad Request",
  "path": "/person"
}
```

Since `Person` is non-nullable — it's validated without `@NotNull` annotation

</v-click>

---

# Non-empty `POST` with empty properties

```http 
POST localhost:8080/person
Content-Type: application/json

{"name": null, "age": null}
```
<v-click>

On client
```http {all|1}
HTTP/1.1 400
Content-Type: application/json
```

</v-click>

<v-click>

On server
```plain {all|2}
…Instantiation of [simple type, class com.github.asm0dey.sample.Person] 
  value failed for JSON property name due to missing
```

</v-click>


---

# `POST` with non-empty name

```http {all|4}
POST localhost:8080/person
Content-Type: application/json

{"name": "Pasha", "age": null}
```

<v-click>

```http {all|1}
HTTP/1.1 200 
Content-Length: 0
```

</v-click>

<v-click>

<h1 class="text-center"><bold>Wait, what?</bold> <twemoji-face-screaming-in-fear /></h1>

</v-click>

---
layout: two-cols
---

<template v-slot:default>

# Rechecking

```kotlin {all|3}
data class Person(
    val name: String,
    val age: Double
)
```

</template>

<template v-slot:right>
<v-click>

![](/right.jpg)

</v-click>
</template>


---
layout: statement
---

# When possible types are converted to primitives

---

# Updating class

```kotlin {all|3}
data class Person(
  val name: String,
  @field:NotNull val age: Double?
)
```

<v-click>

```http {all|4}
POST localhost:8080/person
Content-Type: application/json

{"name": "Pasha", "age": null}
```

</v-click>
<v-click>

```http
HTTP/1.1 400 
…
{ "timestamp": 1674760360096, "status": 400, "error": "Bad Request", "path": "/person" }
```

</v-click>
<v-click>

```plain
Field error in object 'person' on field 'age': rejected value [null]
```

<h2 class="text-center">Hooray!<twemoji-party-popper /></h2>

</v-click>


---
layout: section
---

# JPA

---

# Is this a good idea?

```kotlin
@Entity
data class Person(
    @Id
    @GeneratedValue(strategy = IDENTITY)
    var id: Int? = null,
    @Column(nullable = false)
    val name: String,
    @Column(nullable = false)
    val age:Double,
)
```

<v-click>

No

</v-click>
<v-click>

> JPA is not designed to work with immutable classes or the methods generated automatically by `data` classes

</v-click>

---

# Better way

```kotlin {all|1|3,4,5|5,7,9}
@Entity
class Person(
  @Id
  @GeneratedValue(strategy = IDENTITY)
  var id: Int? = null,
  @Column(nullable = false)
  var name: String,
  @Column(nullable = false)
  var age: Double,
)
```

- No `data`
- Annotations on constructor arguments
- All arguments are `var`


---

# How does it work?

Magic:
```kotlin
kotlin("plugin.jpa") version "1.8.0"
```

<v-clicks>

- Puts annotations on the fields
- Adds a default constructor in bytecode*!

<small>* In Kotlin the default constructor would not be possible, but in Java it is</small>

</v-clicks>

---

# Is this enough?

Not quite.

At the very least we have to redefine `equals` and `hashCode`.

For example…
```kotlin {all|2-4|4,9|6-8}
@Entity
class Person(
  // properties
) {
  // equals…
  override fun hashCode(): Int {
    return id ?: 0
  }
}
```

---
layout: section
---

# JDBC

---

# Obtain user by id

Let's imagine we need to call the following:
```sql
SELECT *
FROM  users
WHERE id = ?
```

---

# In Java

```java {all|1|2|5-13|7|8|9|10|11}
public List<Person> findByUsername(int id) {
  return jdbcTemplate.query("SELECT * FROM users WHERE id = ?", new UserRowMapper(), id);
}

private static class UserRowMapper implements RowMapper<Person> {
  @Override
  public Person mapRow(ResultSet resultSet, int i) throws SQLException {
    int id = resultSet.getInt("id");
    String name = resultSet.getString("name");
    Double age = resultSet.getDouble("age");
    return new Person(id, name, age);
  }
}
```
---

# Inline

```java {all|2|3-6|7}
public List<Person> findByUsername(int userId) {
    return jdbcTemplate.query("SELECT * FROM users WHERE id = ?", (resultSet, i) -> {
        int id = resultSet.getInt("id");
        String name = resultSet.getString("name");
        Double age = resultSet.getDouble("age");
        return new Person(id1, name, age);
    }, userId);
}
```

<v-click>

<twemoji-loudly-crying-face />

</v-click>

---

# Why?

<v-clicks>

Let's Look at the signature

```java
public <T> List<T> query(String sql, RowMapper<T> rowMapper, @Nullable Object... args)
```

Because in <logos-java /> vararg can be only the last… <twemoji-sad-but-relieved-face />

</v-clicks>
---

# `JdbcTemplate` in Kotlin <flat-color-icons-entering-heaven-alive />

```kotlin
return jdbcTemplate.query("SELECT * FROM users WHERE id = ?", userId) { rs, _ ->
    val id = rs.getInt("id")
    val name = rs.getString("name")
    val age = rs.getDouble("age")
    Person(id, name, age)
}
```

- vararg doesn't have to be in the last position
- unneded parameter of a lambda can be named `_`


---

# Extension functions

```kotlin {all|1|2|3|4}
fun <T> JdbcOperations.query(
  sql: String,
  vararg args: Any,
  function: (ResultSet, Int) -> T
): List<T>
```

<v-click>

Which allows
```kotlin {monaco}
return jdbcTemplate.query("SELECT * FROM users WHERE id = ?", userId) 
{ rs, _ ->
    // TODO: ResultSet → Person
}
```

</v-click>


---

# Let's start simple

```kotlin {all|2-4|5}
val beans = beans {
    bean { jacksonObjectMapper() }
}
```


---

# Custom bean

```kotlin {1-7|1|3-5|12,1}
class JsonLogger(private val objectMapper: ObjectMapper) {
    fun log(o: Any) {
        if (o::class.isData) {
            println(objectMapper.writeValueAsString(o))
        } else println(o.toString())
    }
}

val beans = beans {
    bean { jacksonObjectMapper() }
    bean(::JsonLogger)
}
```

---

# Arbitrary logic

```kotlin {all|5-7}
val beans = beans {
    bean { jacksonObjectMapper() }
    bean(::JsonLogger)
    bean("randomGoodThing", isLazyInit = Random.nextBoolean()) {
        if (Random.nextBoolean()) "Norway" else "Well"
    }
}
```

---

# Requires some glue to work

```kotlin {all|1|2}
class BeansInitializer : ApplicationContextInitializer<GenericApplicationContext> {
    override fun initialize(context: GenericApplicationContext) = beans.initialize(context)
}
```

<v-click>

`application.yml`:

```yaml
context.initializer.classes: "com.github.asm0dey.sample.BeansInitializer"
```

</v-click>
