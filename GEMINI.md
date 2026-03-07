# Code Development and Architecture Guidelines (GEMINI.md)

This document defines the standard for JavaScript (ES2022) source code formatting to ensure cognitive ease of reading, minimize side effects, and automate quality control through AST analysis (ESLint).

---

## 1. Runtime Environment and Lexical Context

The project is oriented towards modern browser APIs and a modular system.

* **Runtime:** Browser (`window`, `document` objects are available).
* **Syntax:** ECMAScript 2022 (support for private class fields, Top-level awaits).
* **Module System:** **ESM** (`import/export`) only. The use of `require` is prohibited.
* **Global Objects:** Access to external libraries `noUiSlider` and `Pristine` is allowed in `readonly` mode only.

---

## 2. State and Variable Management

### 2.1. Immutability and Scope
We use a strict variable declaration model to eliminate unpredictable behavior (hoisting).

* **Prohibition of `var`:** Using `var` is unacceptable due to the lack of block scope.
* **Priority of `const`:** Any identifier must be declared as `const` unless its reassignment is required. This reduces code entropy.
* **Shadowing Prohibition:** Variables must not be named with identifiers already occupied in the outer scope. This removes ambiguity when reading closures.

#### Example:
**Bad:**
```javascript
let factor = 2;
function calculate(price) {
  const factor = 3; // Error: Shadowing
  return price * factor;
}
```
**Good:**
```javascript
const DISCOUNT_FACTOR = 2;
const calculatePrice = (price) => price * DISCOUNT_FACTOR;
```

---

## 3. Functions and Functional Expressions

### 3.1. Arrow Functions
Arrow functions are a priority for callbacks and concise transformations.

* **Arrow-body:** If a function contains only a `return` expression, the curly braces and the `return` keyword should be omitted (`as-needed`).
* **Arrow-parens:** Arrow function arguments are always enclosed in parentheses, even if there is only one argument. This simplifies the latest refactoring.

### 3.2. Function Hoisting
The `no-use-before-define` rule is configured with the `{ "functions": false }` parameter. This allows placing high-level logic at the beginning of the file and auxiliary functions at the end, implementing a "top-down" principle.

---

## 4. Style and Formatting (Code Layout)

### 4.1. Indentation System
* **Indentation:** two spaces.
* **Switch-statements:** `case` blocks must be indented relative to the `switch`.
* **Empty lines:**
  * More than one consecutive empty line is prohibited.
  * A mandatory empty line at the end of the file (`eol-last`).
  * A mandatory empty line between class methods (`lines-between-class-members`), except for single-line getters/setters.

### 4.2. Punctuation and Strings
* **Quotes:** Single quotes `'` only. Double quotes are allowed only inside strings for escaping or in JSON.
* **Semicolon:** Mandatory (`always`). We do not rely on the ASI (Automatic Semicolon Insertion) mechanism.
* **Template Strings:** Priority over concatenation. Using `${}` in regular strings is prohibited (protection against typos).

---

## 5. Prevention of Logical Errors

### 5.1. Comparison and Typing
* **Strict Equality:** The use of `==` and `!=` is prohibited. Only `===` and `!==` are allowed. This eliminates implicit type coercion.
* **Radix:** When calling `parseInt()`, always pass the second argument (the base of the number system).

### 5.2. Control of Ternary Expressions
The ternary operator should be simple.
* Nested ternary operators are prohibited (`no-nested-ternary`).
* Redundant operators are prohibited (e.g., `condition ? true : false`).

### 5.3. Expression Purity
* Assignment inside `return`, `if`, or `while` is prohibited.
* Use of unused expressions (calling a function without saving the result, if it is not a side effect) is prohibited.

---

## 6. Safety and Debugging

* **Production-ready:** Any use of `console.log`, `alert`, or `debugger` is considered an error. For logging during development, use wrappers that are removed during the build process.
* **Async/Await:** Creating `new Promise(async (resolve, reject) => ... )` is prohibited. Standard mechanisms cannot catch errors inside such an executor.

---

## 7. Syntax Summary (Cheat Sheet)

| Entity          | Rule                                                     |
|:----------------|:---------------------------------------------------------|
| **Variables**   | `camelCase`, `const` by default                          |
| **Strings**     | `'single quotes'`, `template literals` for interpolation |
| **Indentation** | 2 spaces, `semi` — always                                |
| **Classes**     | Empty line between methods                               |
| **Comparison**  | Only `===`                                               |
| **Logic**       | No nested ternary operators                              |
| **Tools**       | Prohibition of `console`, `alert`, `debugger`            |

---

## 8. Recommendations for Writing Tests (Unit Testing)

The process of verifying the correctness of software modules within this framework relies on the principles of determinism and isolation. The test structure should mirror the `src/` architecture.

### 8.1. Organization and Structure
* **Hierarchical Correspondence:** Test files should be located in subdirectories corresponding to the namespace of the component under test.
* **Granularity:** Each entity or prototype method is tested in a separate file.
  * *Name format:* `Entity.method.test.js`, `Entity.behavior.test.js`, or `util.get-datatime.test.js`.

### 8.2. Test Design Pattern
It is recommended to adhere to the **AAA (Arrange, Act, Assert)** pattern or **Given, When, Then**, to ensure clarity and readability:
1.  **Arrange (Given):** Initialize input data, load HTML markup, or create class instances.
2.  **Act (When):** Call the method under test or execute a pipeline chain.
3.  **Assert (Then):** Compare the actual result with the expected one (using `expect`).

### 8.3. Assert-section Requirements
* Avoid logic (loops, conditions) inside the tests themselves. A test should be linear.
* To compare objects and arrays, use `toStrictEqual()` or `toEqual()` to guarantee full correspondence of data structures and types.
* When testing exceptions, use `toThrow()`, verifying not only the fact of the error but also the correspondence of the exception class (e.g., `ApplicationException`).

---

**Example of a Unit Test Structure for a DOM Manipulator:**
```javascript
// tests/Framework/Unit/Dom/Manipulator/Manipulator.html.test.js
import { Manipulator } from '../../../../src/Framework/Dom/Manipulator/Manipulator';

describe('Manipulator.html()', () => {
  it('should update innerHTML of the element', () => {
    // Arrange
    const element = document.createElement('div');
    const newContent = '<span>Update</span>';

    // Act
    Manipulator.html(element, newContent);

    // Assert
    expect(element.innerHTML).toBe(newContent);
  });
});
```
