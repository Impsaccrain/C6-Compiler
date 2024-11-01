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
c6 [filepath]
```
but obviously replace `[filepath]` with the actual path to your file. You can run this to get the current version's documentations:
```powershell
c6 --docs
```

# Why make this language?
This language was made with the goal of being just as fast as languages like C or C++, while maintaining readability
and easy usage. It provides a lot of extra functions and less boilerplate, as will be discussed in another section of the README.

# The C6 Compiler
The C6 language is a "superset" of the C++ programming language. It contains features such as automatic inclusion of
`#include` statements for standard libraries, meaning you no longer have to say things like `#include <iostream>`,
`#include <random>`, `#include <string>`, etc. You now only need to use it when importing from a local file. These
local files must be in C++ code, because of how the compiler works. Since the compiler compiles C6 code to C++ code,
you can still write these local files in C6, just make sure to compile them and then link that compiled script.

To demonstrate the removal of `#include` statements, here is an example of a hello world program in C6:
```cpp
int main() {
  std::cout << "Hello, world!" << std::endl;
  return 0;
};
```
Compiling this script will automatically make it include `<iostream>`, as that is what is required here.
But here is a better example of a hello world program in C6:

```cpp
int main() {
  c6::println("Hello, world!");
  return 0;
};
```
Just as `std` is C++'s standard namespace, `c6` is C6's standard namespace. C6 still supports everything that is
in C++'s `std`, but its `c6` namespace makes a lot of operations easier. This language is aimed to make C++ easier.

Just like C++'s `std`, you can also put `using namespace c6;` at the top of your code to eliminate the need for writing
`c6::` before every function and type that `c6` provides. However, it is considered bad practice to include both namespaces
`c6` and `std` at the top of your file using `using namespace`. This is because a few `c6` functions have the same name as
`std` functions, which could cause confusion.

# Function Documentation (v1.1.0)

**int c6::randint(int min, int max)**
Generates a random integer between the min and the max values then returns it.

**void c6::write_file(std::string path, std::string contents, bool overwrite = true)**
Writes the contents to the file at the provided path. Overwrite is optional and determines whether to overwrite
the file or append to it. If there is no file at the provided path it will raise a `std::runtime_error`.

**std::string c6::read_file(std::string path)**
Gets the contents of the file at the provided path and returns them. If there is no file at the provided
path it will raise a `std::runtime_error`.

**void c6::println(T text)**
Prints the provided text to the console with an automatic newline. The text can be a variety of types, including
`std::string`, `int`, `long`, `double`, `float`, and other primitive types.

**std::string c6::input(T text)**
Prints the provided text to the console and waits for user input. Once it recieves user input, it will return it as a `std::string`.

**int c6::to_int(std::string value)**
Attempts to convert the `std::string` value to an int then return it. If it fails, it will throw a `std::runtime_error`.

**std::string c6::to_string(T value)**
Will convert any primitive type to a string (`int`, `float`, `double`, `long`, `bool`, etc).

# Changelog

v1.1.0 - Added the C6 help menu, the documentation, and released it to the public.

v1.0.1 - Fixed a critical bug in compilation.

v1.0.0 - Initial creation.
