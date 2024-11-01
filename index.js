#!/usr/bin/env node

const fs = require('fs');
const args = process.argv.slice(2);
const path = require('node:path');

const headerMap = {
    '<iostream>': ['cout', 'cin', 'cerr', 'ostream', 'istream'],
    '<fstream>': ['ifstream', 'ofstream', 'fstream'],
    '<sstream>': ['istringstream', 'ostringstream', 'stringstream'],
    '<vector>': ['vector'],
    '<list>': ['list'],
    '<deque>': ['deque'],
    '<set>': ['set', 'multiset'],
    '<map>': ['map', 'multimap'],
    '<unordered_set>': ['unordered_set'],
    '<unordered_map>': ['unordered_map'],
    '<array>': ['array'],
    '<forward_list>': ['forward_list'],
    '<stack>': ['stack'],
    '<queue>': ['queue', 'priority_queue'],
    '<algorithm>': ['sort', 'find', 'copy', 'accumulate', 'for_each', 'transform', 'count', 'min', 'max'],
    '<numeric>': ['accumulate', 'inner_product', 'partial_sum', 'adjacent_difference'],
    '<cmath>': ['sqrt', 'pow', 'sin', 'cos', 'tan', 'log', 'exp', 'ceil', 'floor', 'abs'],
    '<cstdlib>': ['malloc', 'free', 'rand', 'srand', 'atoi', 'atof', 'exit'],
    '<cstring>': ['strlen', 'strcpy', 'strcat', 'strcmp', 'memset', 'memcpy'],
    '<ctime>': ['time', 'localtime', 'strftime', 'difftime', 'clock'],
    '<cstdio>': ['printf', 'scanf', 'fopen', 'fclose', 'fprintf', 'fscanf'],
    '<thread>': ['thread', 'this_thread'],
    '<mutex>': ['mutex', 'lock_guard', 'unique_lock', 'recursive_mutex'],
    '<condition_variable>': ['condition_variable'],
    '<atomic>': ['atomic', 'atomic_flag', 'atomic_int'],
    '<functional>': ['function', 'bind', 'packaged_task'],
    '<memory>': ['unique_ptr', 'shared_ptr', 'weak_ptr', 'make_unique', 'make_shared', 'allocator'],
    '<type_traits>': ['is_same', 'enable_if', 'decay', 'is_base_of', 'remove_pointer'],
    '<optional>': ['optional'],
    '<variant>': ['variant'],
    '<tuple>': ['tuple', 'get', 'make_tuple'],
    '<any>': ['any', 'any_cast'],
    '<exception>': ['exception', 'runtime_error', 'logic_error', 'bad_alloc'],
    '<limits>': ['numeric_limits'],
    '<iterator>': ['iterator', 'reverse_iterator', 'ostream_iterator'],
    '<regex>': ['regex', 'smatch', 'sregex_iterator', 'regex_search', 'regex_replace'],
    '<chrono>': ['chrono'],
    '<filesystem>': ['path', 'file_status', 'directory_iterator', 'recursive_directory_iterator'],
    '<iomanip>': ['setprecision', 'fixed', 'scientific', 'showpoint', 'noshowpoint', 'setw', 'setfill', 'left', 'right', 'internal', 'hex', 'dec', 'oct', 'showbase', 'noshowbase', 'showpos', 'noshowpos'],
    '<random>': ['minstd_rand', 'mt19937', 'mt19937_64', 'ranlux24_base', 'ranlux48_base', 'default_random_engine', 'random_device', 'uniform_int_distribution', 'uniform_real_distribution', 'bernoulli_distribution', 'binomial_distribution', 'negative_binomial_distribution', 'poisson_distribution', 'normal_distribution', 'lognormal_distribution', 'exponential_distribution', 'weibull_distribution', 'gamma_distribution', 'chi_squared_distribution', 'cauchy_distribution', 'student_t_distribution', 'seed_seq', 'shuffle', 'generate'],
    '<stdexcept>': ['invalid_argument', 'out_of_range', 'runtime_error'],
    '<string>': ['string', 'basic_string', 'wstring', 'u16string', 'u32string', 'getline', 'string_view', 'to_string', 'stoi', 'stol', 'stoll', 'stof', 'stod', 'stold', 'strchr', 'strrchr', 'strstr', 'compare', 'swap']
};

const customFunctionMap = {
    write_file: {
        returnType: {
            namespace: null, // Namespace null if it is not assigned to any namespace.
            name: 'void'
        },
        params: [
            {
                name: 'path',
                type: {
                    namespace: 'std',
                    name: 'string',
                    const: true,
                    ptr: '&'
                },
                optional: false
            },
            {
                name: 'contents',
                type: {
                    namespace: 'std',
                    name: 'string',
                    const: true,
                    ptr: '&'
                },
                optional: false
            },
            {
                name: 'overwrite',
                type: {
                    namespace: null,
                    name: 'bool',
                    const: true
                },
                optional: 'true' // true as its default value
            }
        ],
        code: `
            if (overwrite) {
                std::ofstream outFile(path);
                if (!outFile) {
                    throw std::runtime_error("Error opening file for writing.");
                };
                outFile << contents;
                outFile.close();
            } else {
                std::ofstream outFile(path, std::ios::app);
                if (!outFile) {
                    throw std::runtime_error("Error opening file for writing.");
                };
                outFile << contents;
                outFile.close();
            };
        `
    },
    read_file: {
        returnType: {
            namespace: 'std',
            name: 'string'
        },
        params: [
            {
                name: 'path',
                type: {
                    namespace: 'std',
                    name: 'string',
                    const: true,
                    ptr: '&'
                },
                optional: false
            }
        ],
        code: `
            std::ifstream inFile(path);
            if (!inFile) {
                throw std::runtime_error("Error opening file for reading.");
            };
            std::string line, contents;
            while (std::getline(inFile, line)) {
                contents += line + "\\n";
            };
            inFile.close();
            return contents;
        `
    },
    randint: {
        returnType: {
            namespace: null,
            name: 'int'
        },
        params: [
            {
                name: 'min',
                type: {
                    namespace: null,
                    name: 'int'
                },
                optional: false
            },
            {
                name: 'max',
                type: {
                    namespace: null,
                    name: 'int'
                },
                optional: false
            }
        ],
        code: `
            std::random_device rd;
            std::mt19937 gen(rd());
            std::uniform_int_distribution<> dis(min, max);
            return dis(gen);
        `
    },
    println: {
        template: {
            typename: 'T'
        },
        returnType: {
            namespace: null,
            name: 'void'
        },
        params: [
            {
                name: 'text',
                type: {
                    namespace: null,
                    name: 'T'
                },
                optional: false
            }
        ],
        code: `
            std::cout << text << std::endl;
        `
    },
    input: {
        template: {
            typename: 'T'
        },
        returnType: {
            namespace: 'std',
            name: 'string'
        },
        params: [
            {
                name: 'text',
                type: {
                    namespace: null,
                    name: 'T',
                    const: true,
                    ptr: '&'
                },
                optional: false,
            }
        ],
        code: `
            std::cout << text;
            std::string data;
            std::getline(std::cin, data);
            return data;
        `
    },
    to_int: {
        returnType: {
            namespace: null,
            name: 'int'
        },
        params: [
            {
                name: 'value',
                type: {
                    namespace: 'std',
                    name: 'string',
                    const: true,
                    ptr: '&'
                },
                optional: false
            }
        ],
        code: `
            try {
                return std::stoi(value);
            } catch (const std::invalid_argument& e) {
                throw std::runtime_error(std::string("Invalid argument: ") + e.what());
            } catch (const std::out_of_range& e) {
                throw std::runtime_error(std::string("Out of range: ") + e.what());
            };
        `
    },
    to_string: {
        template: {
            typename: 'T'
        },
        returnType: {
            namespace: 'std',
            name: 'string'
        },
        params: [
            {
                name: 'value',
                type: {
                    namespace: null,
                    name: 'T',
                },
                optional: false
            }
        ],
        code: `
            return std::to_string(value);
        `
    }
};

function compile(filePath) {
    function getRequiredHeaders(code) {
        code = code.replace(/\/\/.*?$|\/\*.*?\*\//g, '');
        code = code.toLowerCase();

        const identifiers = code.match(/\b[a-zA-Z_][a-zA-Z\d_]*\b/g);

        const requiredHeaders = new Set();

        for (let header in headerMap) {
            if (identifiers.some(i => headerMap[header].includes(i))) {
                requiredHeaders.add(header);
            };
        };

        return requiredHeaders;
    };

    function getTypeName(data) {
        let type = data.namespace ? data.namespace + '::' + data.name : data.name;
        if (data.ptr) {
            type += data.ptr;
        };
        if (data.const) {
            type = 'const ' + type;
        };
        return type;
    };

    function constructCPPFunction(name) {
        const data = customFunctionMap[name];
        let templateStr = '';
        if (data.template) {
            templateStr = 'template<typename ' + data.template.typename + '>\n'
        };
        const params = data.params.map(i => `${getTypeName(i.type)} ${i.name}${i.optional !== false ? ' = ' + i.optional : ''}`).join(', ');
        const funcName = `${getTypeName(data.returnType)} ${name}(${params}) {`;
        return templateStr + funcName + '\n' + data.code + '\n};';
    };

    const trimmed = filePath.trim();
    if (!/\.c6$/.test(trimmed)) {
        console.log('This file is not a `.c6` file! Please make sure to input a C6 file.');
        process.exit(1);
    };

    let c6Code;
    try {
        c6Code = fs.readFileSync(trimmed, 'utf8');
    } catch {
        console.log(`The file at ${filePath} does not exist!`);
        process.exit(1);
    };

    let namespaceCode = `namespace c6 {\n`;

    let mapped = c6Code;
    for (let func in customFunctionMap) {
        if (new RegExp('\\b' + func + '\\b').test(mapped)) {
            namespaceCode += constructCPPFunction(func);
        };
    };

    namespaceCode += '\n};\n';
    mapped = namespaceCode + mapped;

    const requiredHeaders = Array.from(getRequiredHeaders(mapped));
    const output = requiredHeaders.map(header => `#include ${header}`).join('\n') + '\n' + mapped;

    const fileName = path.basename(trimmed);
    const dirName = path.dirname(trimmed);

    fs.writeFileSync(path.join(dirName, fileName.replace(/\.c6$/, '.cpp')), output);
};

if (args.length == 0) {
    console.log(`
C6 COMPILER HELP - VERSION 1.1.0

c6 [filepath] - Compiles the file at [filepath] to a C++ file of the same name in the same directory.
\x1b[30mNote: Compiler does not have an error checker. If the C6 code has an error, it may still compile.\x1b[0m
c6 \x1b[30m--docs\x1b[0m - Will log the documentations for C6.
    `);
    process.exit(0);
} else {
    if (args[0] == '--docs') {
        console.log(`
\x1b[1mint c6::randint(int min, int max)\x1b[0m
Generates a random integer between the min and the max values then returns it.

\x1b[1mvoid c6::write_file(std::string path, std::string contents, bool overwrite = true)\x1b[0m
Writes the contents to the file at the provided path. Overwrite is optional and determines whether to overwrite
the file or append to it. If there is no file at the provided path it will raise a std::runtime_error.

\x1b[1mstd::string c6::read_file(std::string path)\x1b[0m
Gets the contents of the file at the provided path and returns them. If there is no file at the provided
path it will raise a std::runtime_error.

\x1b[1mvoid c6::println(T text)\x1b[0m
Prints the provided text to the console with an automatic newline. The text can be a variety of types, including
std::string, int, long, double, float, and other primitive types.

\x1b[1mstd::string c6::input(T text)\x1b[0m
Prints the provided text to the console and waits for user input. Once it recieves user input, it will return it as a std::string.

\x1b[1mint c6::to_int(std::string value)\x1b[0m
Attempts to convert the std::string value to an int then return it. If it fails, it will throw a std::runtime_error.

\x1b[1mstd::string c6::to_string(T value)\x1b[0m
Will convert any primitive type to a string (int, float, double, long, bool, etc).
        `);
        process.exit(0);
    };
    console.log('Compiling C6...');
    compile(args[0]);
    console.log('Compilation successful!');
    process.exit(0);
};