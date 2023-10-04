---
theme: apple-basic
css: unocss
background: https://source.unsplash.com/collection/94734566/1920x1080
lineNumbers: true
drawings:
  persist: false
colorSchema: 'dark'
layout: intro
highlighter: prism
canvasWidth: 920
exportFilename: 'index'
export:
  format: pdf
  timeout: 30000
  withClicks: true
  withToc: false
---

#  Advanced Kotlin Techniques for Spring Developers

## <logos-kotlin-icon /><logos-spring-icon />

---
layout: image-right
image: 'avatar.jpg'
---

<style>.smaller{ width: 300px }</style>

# `whoami`

<v-clicks>

- <div v-after>Pasha Finkelshteyn</div>
- Dev <noto-v1-avocado /> at <logos-jetbrains />
- ≈10 years in JVM. Mostly <logos-java /> and <logos-kotlin-icon />
- And <logos-spring-icon />
- <logos-twitter /> asm0di0
- <logos-mastodon-icon /> @asm0dey@fosstodon.org

</v-clicks>
<v-click class="smaller">

![](/everywhere.jpg)

</v-click>

---
layout: statement
---

# That's what I learned

---

# My application

<v-clicks>

- Simple nano-service
- MVC
- Validation
- JPA
- JDBC
- Tests

</v-clicks>

---

# Where do I start?

https://start.spring.io

![](/settings.png)

---

# Minimum dependencies

<img src="/deps.png" class="max-h-310px"/>

[Full config](https://start.spring.io/#!type=gradle-project-kotlin&language=kotlin&platformVersion=3.0.2&packaging=jar&jvmVersion=17&groupId=com.github.asm0dey&artifactId=sample&name=sample&description=Demo%20project%20for%20Spring%20Boot&packageName=com.github.asm0dey.sample&dependencies=data-jpa,postgresql,validation,web,security,testcontainers)


---

# 2 files are generated

- `build.gradle.kts`
- `SpringKotlinStartApplication.kt`

---

# What happens

```kotlin 
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

# The main class

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

```kotlin {all|1|2}
inline fun <reified T : Any> runApplication(vararg args: String): ConfigurableApplicationContext =
		SpringApplication.run(T::class.java, *args)
```

<v-click>

The first goodie of Spring for Kotlin

</v-click>

---
layout: statement
---

# Let's start implementing

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
  val age: Int
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
HTTP/1.1 400 Bad Request
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

# Why? How?

`build.greadle.kts`:
```kotlin {all|1|3}
tasks.withType<KotlinCompile> {
	kotlinOptions {
		freeCompilerArgs = listOf("-Xjsr305=strict")
		jvmTarget = "17"
	}
}
```
<v-click>

## `JSR 305: Annotations for Software Defect Detection`:

> Nullness annotations (e.g., `@NonNull` and `@CheckForNull`)

> Internationalization annotations, such as `@NonNls` or `@Nls`

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
HTTP/1.1 400 Bad Request
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

<style>
  img {
    width: 300px
  }
</style>

![](/right.jpg)

::right::

<v-click>

# Let's recheck

```kotlin {all|3}
data class Person(
  val name: String,
  val age: Double
)
```

</v-click>

---
layout: statement
---

# In JVM primitive types have default values

---

# These types will be JVM primitives:

- Double
- Int
- Float
- Char
- Short
- Byte
- Boolean


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
HTTP/1.1 400 Bad Request
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

# Workaround

```yaml {all|4}
spring:
  jackson:
    deserialization:
      FAIL_ON_NULL_FOR_PRIMITIVES: true
```

<div v-click>Remember! That works only for Jackson and deserialization!</div>

---

# Quick summary

- `-Xjsr305=strict` will make the validation easier
- On JVM primitive types have default values
- For JVM primitive types we have to put `@field:NotNull` and mark them nullable


---
layout: section
---

# JPA

---
clicks: 3
---

# Nanoentity

```kotlin {all|2|7,9|2,10}
@Entity
data class Person(
  @Id
  @GeneratedValue(strategy = IDENTITY)
  var id: Int? = null,
  @Column(nullable = false)
  val name: String,
  @Column(nullable = false)
  val age: Int,
)
```

<ul>
  <li v-click="1">
  <span><code>data</code> class</span>
  </li>
  <li v-click="2">
  <span><code>val name</code> and <code>val age</code></span>
  </li>
  <li v-click="3">
  <span>No no-arg constructor</span>
  </li>
</ul>

---

# Improving

`data` classes have `copy`, `equals`, `hashCode`, `copy`, and `componentX` defined

```kotlin {all|2}
@Entity
data class Person(
  @Id
  @GeneratedValue(strategy = IDENTITY)
  var id: Int? = null,
  @Column(nullable = false)
  val name: String,
  @Column(nullable = false)
  val age: Int,
)
```

---

# Improving

`data` classes have `copy`, `equals`, `hashCode`, `copy`, and `componentX` defined

```kotlin {2|7,9}
@Entity
class Person(
  @Id
  @GeneratedValue(strategy = IDENTITY)
  var id: Int? = null,
  @Column(nullable = false)
  val name: String,
  @Column(nullable = false)
  val age: Int,
)
```

<v-click>

JPA won's be able to write to `val`

</v-click>

---

# Improving

`data` classes have `copy`, `equals`, `hashCode`, `copy`, and `componentX` defined

```kotlin {7,9}
@Entity
class Person(
  @Id
  @GeneratedValue(strategy = IDENTITY)
  var id: Int? = null,
  @Column(nullable = false)
  var name: String,
  @Column(nullable = false)
  var age: Int,
)
```

JPA won's be able to write to `val`

---

# But there is no no-arg constructor!

How to make it work?

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

# Current result

```kotlin
@Entity
class Person(
  @Id
  @GeneratedValue(strategy = IDENTITY)
  var id: Int? = null,
  @Column(nullable = false)
  var name: String,
  @Column(nullable = false)
  var age: Int,
)
```

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

# Is it perfect after fixes?

It is perfect? It's perfectly working.

What we can think about?

<v-click>

```kotlin
@Id @GeneratedValue(strategy = IDENTITY)
val id: Long = 0,
```

This way we won't be able to rewrite an immutable property

</v-click>
<div v-click>We might also use it for other properties</div>


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

# Worse example

```sql
SELECT DISTINCT book.id
              , (SELECT COALESCE(JSON_GROUP_ARRAY(JSON_ARRAY(t.v0, t.v1, t.v2, t.v3, t.v 4, t.v5, t.v6, t.v7, t.v8,
                                                             t.v9)), JSON_ARRAY())
                 FROM (SELECT b.id AS v0 , b.path AS v1 , b.name AS v2 , b.date AS v3 , b.added AS v4 , b.sequence AS v5
                            , b.sequence_number AS v6 , b.lang AS v7 , b.zip_file AS v8 , b.seqid AS v9 FROM book AS b
                       WHERE b.id = book.id) AS t)                AS book
              , (SELECT COALESCE(JSON_GROUP_ARRAY(JSON_ARRAY(t.v0, t.v1, t.v2, t.v3, t.v4, t.v5, t.v6)), JSON_ARRAY())
                 FROM (SELECT DISTINCT author.id AS v0 , author.fb2id AS v1 , author.first _name AS v2
                                    , author.middle_name AS v3 , author.last_name AS v4 , author.nickname AS v5 , author.added AS v6
                       FROM author
                                JOIN book_author ON book_author.author_id = author.id
                       WHERE book_author.book_id = book.id) AS t) AS authors
              , (SELECT COALESCE(JSON_GROUP_ARRAY(JSON_ARRAY(t.v0, t.v1)), JSON_ARRAY())
                 FROM (SELECT DISTINCT genre.name AS v0, genre.id AS v1
                       FROM genre
                                JOIN book_genre ON book_genre.genre_id = genre.id
                       WHERE book_genre.book_id = book.id) AS t)  AS genres
              , book.sequence
FROM book
         JOIN book_author ON book_author.book_id = book.id
WHERE (book.seqid = 40792 AND book_author.author_id = 34606)
ORDER BY book.sequence_number ASC NULLS LAST, book.name
```

---

# In Java

<logos-java />
```java {all|1|2|5-13|7|8|9|10|11}
public List<Person> findById(int id) {
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

# Let's inline mapper

<logos-java />
```java {all|2|3-6|7}
public List<Person> findById(int userId) {
  return jdbcTemplate.query("SELECT * FROM users WHERE id = ?", (resultSet, i) -> {
    int id = resultSet.getInt("id");
    String name = resultSet.getString("name");
    Double age = resultSet.getDouble("age");
    return new Person(id1, name, age);
  }, userId);
}
```

<v-click>

- Too many mappers
- Parameters too far from query

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

```kotlin {all|1|2-5}
return jdbcTemplate.query("SELECT * FROM users WHERE id = ?", userId) { rs, _ ->
  val id = rs.getInt("id")
  val name = rs.getString("name")
  val age = rs.getDouble("age")
  Person(id, name, age)
}
```

- `vararg` doesn't have to be in the last position
- unused parameter of a lambda can be named `_`


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
```kotlin {all|1|2-4} {lines:false}
return jdbcTemplate.query("SELECT * FROM users WHERE id = ?", userId) 
{ rs, _ ->
  // TODO: ResultSet → Person
}
```

</v-click>

---


# More on extensions for Spring

<div class="flex-justify-between display-flex flex-items-center">

[spring-beans](https://docs.spring.io/spring-framework/docs/6.0.4/kdoc-api/spring-beans/index.html)

[spring-context](https://docs.spring.io/spring-framework/docs/6.0.4/kdoc-api/spring-context/index.html)

[spring-core](https://docs.spring.io/spring-framework/docs/6.0.4/kdoc-api/spring-core/index.html)

</div>
<div class="flex-justify-between display-flex">

[spring-jdbc](https://docs.spring.io/spring-framework/docs/6.0.4/kdoc-api/spring-jdbc/index.html)

[spring-messaging](https://docs.spring.io/spring-framework/docs/6.0.4/kdoc-api/spring-messaging/index.html)

[spring-r2dbc](https://docs.spring.io/spring-framework/docs/6.0.4/kdoc-api/spring-r2dbc/index.html)

</div>
<div class="flex-justify-between display-flex flex-items-center">

[spring-test](https://docs.spring.io/spring-framework/docs/6.0.4/kdoc-api/spring-test/index.html)

[spring-tx](https://docs.spring.io/spring-framework/docs/6.0.4/kdoc-api/spring-tx/index.html)

[spring-web](https://docs.spring.io/spring-framework/docs/6.0.4/kdoc-api/spring-web/index.html)

</div>
<div class="flex-justify-around display-flex">

[spring-webflux](https://docs.spring.io/spring-framework/docs/6.0.4/kdoc-api/spring-webflux/index.html)

[spring-webmvc](https://docs.spring.io/spring-framework/docs/6.0.4/kdoc-api/spring-webmvc/index.html)

</div>

---
layout: section
---

# Configuration

---

# Let's start simple

```kotlin {all|2}
val beans = beans {
  bean { jacksonObjectMapper() }
}
```
<v-click>

Modified Jackson's `ObjectMapper` to work with `data` classes from `jackson-module-kotlin`

```kotlin {all|1|3|2}
@Bean
fun kotlinMapper(): ObjectMapper {
  return jacksonObjectMapper()
}
```

</v-click>
<v-click>

4 lines instead of 1 <twemoji-face-screaming-in-fear />

</v-click>
---

# Custom bean

```kotlin {1-7|1|3-5|11|11,1}
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

```kotlin {all|4-6|5}
val beans = beans {
  bean { jacksonObjectMapper() }
  bean(::JsonLogger)
  bean("randomGoodThing", isLazyInit = Random.nextBoolean()) {
    if (Random.nextBoolean()) "Norway" else "Well"
  }
}
```

---

# OK How do I use it?

Let's return to our very first file

```kotlin
runApplication<SampleApplication>(*args)
```
```kotlin
val beans = { /* */ }
```

<v-click>

Let's change it to
```kotlin {all|2}
runApplication<SampleApplication>(*args) {
  addInitializers(beans)
}
```

</v-click>
<v-click>

And run it…
```plain
Started SampleApplicationKt in 1.776 seconds (process running for 2.133)
```
<twemoji-party-popper />

</v-click>

---

# Let's test it
Bean:
```kotlin {all|2|3}
@Component
class MyBean(val jsonLogger: JsonLogger) {
  fun test() = jsonLogger.log("Test")
}
```
Test:
```kotlin {all|1|3|5}
@SpringBootTest
class ConfigTest {
  @Autowired private lateinit var myBean: MyBean
  @Test
  fun testIt() = assertEquals("Test", myBean.test())
}
```

---
layout: two-cols
---

<template v-slot:default>

# Run it

```plain
No qualifying bean of type 
'com.github.asm0dey.sample.JsonLogger'
  available: expected at least 1 
  bean which qualifies as autowire candidate
```

<div v-click="2">

That's because our tests do not call `main`!

</div>

</template>
<template v-slot:right>

<h1 v-click="1"><img src="/explosion.png"></h1>

</template>

---

# Requires some glue to work

```kotlin {all|1|2|3}
val beans = { /* */ }
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
<v-click>

`Main.kt`:
```kotlin {all|2}
fun main(args: Array<String>) {
  runApplication<SampleApplication>(*args)
}
```

</v-click>

---
layout: section
---

# Security

---

# Spring Security

```kotlin {all|1|7|8|9|10|11|12|13|14,15|18|7-19}
val beans = beans {
  bean { jacksonObjectMapper() }
  bean(::JsonLogger)
  bean("random", isLazyInit = Random.nextBoolean()) {
    if (Random.nextBoolean()) "Norway" else "Well"
  }
  bean {
    val http = ref<HttpSecurity>()
    http {
      csrf { disable() }
      httpBasic { }
      securityMatcher("/**")
      authorizeRequests {
        authorize("/auth/**", authenticated)
        authorize(anyRequest, permitAll)
      }
    }
    http.build()
  }
}
```

---
layout: section
---

# So, what did I learn?

---

# So, what did I learn?

<v-clicks>

- Always generate the project with start.spring.io
- Reified generics might make an API better
- Validation is better with Kotlin, but remember about primitives
- `data` classes should not be used for JPA
- JDBC is simpler with Kotlin
- Bean definition DSL is awesome
- Specifically with security!

</v-clicks>

---
layout: statement
---

# Thank you!

---

# Thank you! Questions?



- <logos-twitter /> asm0di0
- <logos-mastodon-icon /> @asm0dey@fosstodon.org
- <logos-google-gmail /> me@asm0dey.site
- <logos-linkedin-icon /> asm0dey
- <logos-telegram /> asm0dey
- <logos-whatsapp-icon /> asm0dey
- <skill-icons-instagram /> asm0dey
- <logos-facebook /> asm0dey

---
layout: end
---
