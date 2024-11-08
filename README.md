# Usage

Run:
```powershell
npm i -g c6-compiler
```
in your terminal and it will install.
You can then run:
```powershell
c6
```
to get the help menu for C6. Use this to compile a C6 file:
```powershell
c6 <filepath>
```
but obviously replace `<filepath>` with the actual path to your file.

You can benchmark how long it takes for a file to be compiled like this:
```powershell
c6 --benchmark <filepath>
```

You can run this to get the current version's documentations:
```powershell
c6 --docs
```
You can also use `c6 -d`.

This is how you can view the current version of the compiler:
```powershell
c6 --version
```
You can also use `c6 -v`.

Use this to update it if there are any updates:
```powershell
npm update -g c6-compiler
```

# Why make this language?
This language was made with the goal of being just as fast as languages like C or C++, while maintaining readability
and easy usage. It provides a lot of extra functions and less boilerplate, as will be discussed in another section of the README.

# C6 Documentation (v1.2.0)
## Include Statements
The C6 language is a "superset" of the C++ programming language. It contains features such as automatic inclusion of
`#include` statements for standard libraries, meaning you no longer have to say things like `#include <iostream>`,
`#include <random>`, `#include <string>`, etc. You now only need to use it when importing from a local file. These
local files must be in C++ code, because of how the compiler works. Since the compiler compiles C6 code to C++ code,
you can still write these local files in C6, just make sure to compile them and then link that compiled script.

To demonstrate the removal of `#include` statements, here is an example of a hello world program in C6:
```cpp
int main() {
  c6::println("Hello, world!"); // c6::println is a custom function, see more under the C6 namespace.
  return 0;
};
```
Compiling this script will automatically make it include `<iostream>`, as that is what is required here.

## Templates
Templates in the C6 language have been heavily improved from C++ templates. A standard C++ template might look like this:
```cpp
template<typename T>
class MyTemplate { /* code */ };
```

While you can still use this syntax in C6 if you like, C6 now offers a better way to do this:
```cpp
class MyTemplate<T> { /* code */ };
```

This will have the same effect as the first code snippet. You can even do this with other types of parameters.
Here is an example in C++:
```cpp
template<typename T, int someNumber, typename K = int>
class MyTemplate { /* code */ };
```

And here is how you can achieve this in C6:
```cpp
class MyTemplate<T, int someNumber, K = int> { /* code */ };
```

You can even do this with C++20's `requires` clauses. Here is a C++ example:
```cpp
template<typename T = int>
requires MyConcept<T>
class MyTemplate { /* code */ };
```

And here is how you can do this in C6:
```cpp
class MyTemplate<T requires MyConcept<T> = int> { /* code */ };
```

## Lambda Functions
Lambda functions in the C6 language have also been improved. This is an example of a C++ lambda:
```cpp
auto lambda = [](int someParam) {
    return someParam + 10;
};
```

And this is a C6 lambda function:
```cpp
auto lambda = fn(int someParam) {
    return someParam + 10;
};
```

Here is how you can replicate the use of more complex lambdas from C++:
```cpp
auto lambda = [&x, &y]() {
    x += y; // Modifies the original x
};
```

C6:
```cpp
auto lambda = fn() {
    x += y; // Modifies the original x
};
```

As shown here, you can use variables from outside the scope of the lambda function. All variables from
outside the lambda function will be passed by reference (essentially `[&]` in C++). If you wish to pass
a variable by value, just make it a parameter.
Example:
```cpp
int main() {
    int x = 0;
    auto increment = fn(int x) {
        x++; // doesnt modify original x
    };
    increment(x); // x must be passed as an argument to get value
    return 0;
};
```

## The C6 Namespace

Just as `std` is C++'s standard namespace, `c6` is C6's standard namespace. C6 still supports everything that is
in C++'s `std`, but its `c6` namespace makes a lot of operations easier. This language is aimed to make C++ easier.

Just like C++'s `std`, you can also put `using namespace c6;` at the top of your code to eliminate the need for writing
`c6::` before every function and type that `c6` provides. However, it is considered bad practice to include both namespaces
`c6` and `std` at the top of your file using `using namespace`. This is because a few `c6` functions have the same name as
`std` functions, which could cause confusion.

Here is the list of functions:

**`float c6::randfloat(const float min, const float max)`**
Generates a random float between the min and the max values then returns it.

**`int c6::randint(const int min, const int max)`**
Generates a random integer between the min and the max values then returns it.

**`void c6::write_file(const std::string& path, const std::string& contents, const bool overwrite = true)`**
Writes the contents to the file at the provided path. Overwrite is optional and determines whether to overwrite
the file or append to it. If there is no file at the provided path it will raise a `std::runtime_error`.

**`std::string c6::read_file(const std::string& path)`**
Gets the contents of the file at the provided path and returns them. If there is no file at the provided
path it will raise a `std::runtime_error`.

**`void c6::println(const T... text)`**
Prints the provided text to the console with an automatic newline. The text can be a variety of types, including
`std::string`, `int`, `long`, `double`, `float`, and other primitive types.

**`std::string c6::input(const T& text)`**
Prints the provided text to the console and waits for user input. Once it recieves user input, it will return it as a `std::string`.

**`int c6::to_int(const std::string& value)`**
Attempts to convert the `std::string` value to an int then return it. If it fails, it will throw a `std::runtime_error`.

**`std::string c6::to_string(const T value)`**
Will convert any number-like primitive type to a string. This includes the following:
- `int`
- `long`
- `long long`
- `unsigned int`
- `unsigned long`
- `unsigned long long`
- `float`
- `double`
- `long double`
- `bool`

# Changelog

v1.2.0
- Made templates easier.
- Made lambda functions easier.
- Improved README.md.
- Made `c6::println` accept any number of arguments.
- Made `c6::to_string` support `bool` types.
- Added `c6::randfloat`.
- Improved automatic header placement.

v1.1.0
- Added C6 help menu.
- Added documentation.
- Public release.

v1.0.1
- Fixed a critical compiler bug.

v1.0.0
- Initial creation and the C6 namespace.
