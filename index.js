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
    '<type_traits>': ['is_same', 'enable_if', 'decay', 'is_base_of', 'remove_pointer', 'is_same_v'],
    '<optional>': ['optional'],
    '<variant>': ['variant'],
    '<tuple>': ['tuple', 'get', 'make_tuple'],
    '<any>': ['any', 'any_cast'],
    '<exception>': ['exception', 'bad_alloc', 'bad_cast', 'bad_typeid'],
    '<limits>': ['numeric_limits'],
    '<iterator>': ['iterator', 'reverse_iterator', 'ostream_iterator'],
    '<regex>': ['regex', 'smatch', 'sregex_iterator', 'regex_search', 'regex_replace'],
    '<chrono>': ['chrono'],
    '<filesystem>': ['path', 'file_status', 'directory_iterator', 'recursive_directory_iterator'],
    '<iomanip>': ['setprecision', 'fixed', 'scientific', 'showpoint', 'noshowpoint', 'setw', 'setfill', 'left', 'right', 'internal', 'hex', 'dec', 'oct', 'showbase', 'noshowbase', 'showpos', 'noshowpos'],
    '<random>': ['minstd_rand', 'mt19937', 'mt19937_64', 'ranlux24_base', 'ranlux48_base', 'default_random_engine', 'random_device', 'uniform_int_distribution', 'uniform_real_distribution', 'bernoulli_distribution', 'binomial_distribution', 'negative_binomial_distribution', 'poisson_distribution', 'normal_distribution', 'lognormal_distribution', 'exponential_distribution', 'weibull_distribution', 'gamma_distribution', 'chi_squared_distribution', 'cauchy_distribution', 'student_t_distribution', 'seed_seq', 'shuffle', 'generate'],
    '<stdexcept>': ['invalid_argument', 'out_of_range', 'runtime_error', 'length_error', 'overflow_error', 'logic_error', 'domain_error', 'range_error', 'underflow_error'],
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
                    name: 'int',
                    const: true
                },
                optional: false
            },
            {
                name: 'max',
                type: {
                    namespace: null,
                    name: 'int',
                    const: true
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
    randfloat: {
        returnType: {
            namespace: null,
            name: 'float'
        },
        params: [
            {
                name: 'min',
                type: {
                    namespace: null,
                    name: 'float',
                    const: true
                },
                optional: false
            },
            {
                name: 'max',
                type: {
                    namespace: null,
                    name: 'float',
                    const: true
                },
                optional: false
            }
        ],
        code: `
            std::random_device rd;
            std::mt19937 gen(rd());
            std::uniform_real_distribution<float> distr(min, max);
            return distr(gen);
        `
    },
    println: {
        template: {
            custom: true,
            value: 'typename... Args'
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
                    name: 'Args...',
                    const: true
                },
                optional: false
            }
        ],
        code: `
            (std::cout << ... << text) << std::endl;
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
                    const: true
                },
                optional: false
            }
        ],
        code: `
            if constexpr (std::is_same_v<T, bool>) {
                if (value) {
                    return "true";
                } else {
                    return "false";
                };
            };
            return std::to_string(value);
        `
    }
};

function compile(filePath) {
    function getRequiredHeaders(tokens) {
        const requiredHeaders = new Set();

        for (let header in headerMap) {
            if (headerMap[header].some(h => searchFunction(tokens, h, 'std'))) {
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
            if (data.template.custom) {
                templateStr = `template<${data.template.value}>\n`;
            } else {
                templateStr = 'template<typename ' + data.template.typename + '>\n';
            };
        };
        const params = data.params.map(i => `${getTypeName(i.type)} ${i.name}${i.optional !== false ? ' = ' + i.optional : ''}`).join(', ');
        const funcName = `${getTypeName(data.returnType)} ${name}(${params}) {`;
        return templateStr + funcName + '\n' + data.code + '\n};';
    };

    function getTokens(code) {
        const tokens = [];
        let currentType = 'normal';
        let value = '';
        let stringEscaped = false;
        let stringType = '"';
        function resetTokenType(letter) {
            if (/^[a-zA-Z\d_]$/.test(letter)) {
                currentType = 'normal';
            } else {
                currentType = 'symbol-normal';
            };
        };
        for (let i = 0; i < code.length; i++) {
            const letter = code[i];
            switch (currentType) {
                case 'symbol-normal':
                case 'normal': {
                    value += letter;
                    if (code[i + 1] == '"' || code[i + 1] == '\'') {
                        if (value) tokens.push(value);
                        value = '';
                        stringEscaped = false;
                        currentType = 'string';
                        stringType = code[i + 1];
                    } else if (code[i + 1] == '/' && code[i + 2] == '/') {
                        currentType = 'oneline-comment';
                    } else if (code[i + 1] == '/' && code[i + 2] == '*') {
                        currentType = 'multiline-comment';
                    } else if (currentType == 'normal' && !/^[a-zA-Z\d_]$/.test(code[i + 1])) {
                        if (value) tokens.push(value);
                        value = '';
                        currentType = 'symbol-normal';
                    } else if (currentType == 'symbol-normal' && /^[a-zA-Z\d_]$/.test(code[i + 1])) {
                        if (value) tokens.push(value);
                        value = '';
                        currentType = 'normal';
                    };
                    break;
                };
                case 'string': {
                    value += letter;
                    if (letter == stringType && !stringEscaped && value.length > 1) {
                        tokens.push(value);
                        value = '';
                        resetTokenType(code[i + 1]);
                    } else if (letter == '\\' && !stringEscaped) {
                        stringEscaped = true;
                    } else {
                        stringEscaped = false;
                    };
                    break;
                };
                case 'oneline-comment': {
                    if (code[i + 1] == '\n') {
                        currentType = 'symbol-normal';
                    };
                    break;
                };
                case 'multiline-comment': {
                    if (letter == '/' && code[i - 1] == '*') {
                        resetTokenType(code[i + 1]);
                    };
                    break;
                };
            };
        };
        if (value) tokens.push(value);
        const tokensNoWhitespace = tokens.reduce((acc, token) => {
            const noWhitespace = token.replace(/\s/g, '');
            if (noWhitespace) {
                return [...acc, noWhitespace];
            } else {
                return acc;
            };
        }, []);
        return tokensNoWhitespace;
    };

    function searchTokenPattern(pattern, tokens) {
        let successful = 0;
        let successfulTokens = [];
        for (const token of tokens) {
            if (pattern[successful].test(token)) {
                successful++;
                successfulTokens.push(token);
                if (successful >= pattern.length) {
                    return successfulTokens;
                };
            } else if (successful) {
                successful = 0;
                successfulTokens = [];
            };
        };
        return null;
    };

    function searchFunction(tokens, name, namespace = null) {
        const nameRegex = new RegExp('^' + name + '$');
        if (searchTokenPattern([nameRegex], tokens)) {
            return true;
        } else if (namespace && searchTokenPattern([new RegExp('^' + namespace + '$'), /^::$/, nameRegex], tokens)) {
            return true;
        };
    };

    function constructTemplate(declaration) {
        const providedTemplate = declaration.replace(/>\s*{$/, '').replace(/^class [a-zA-Z_][a-zA-Z\d_]*</, '');
        const items = providedTemplate.split(/,\s*/);
        const requires = [];
        let output = 'template<';
        for (let i in items) {
            let isLast = i == items.length - 1;
            let item = items[i].trim();
            if (!item) continue;
            if (!/^([a-zA-Z_][a-zA-Z\d_]*\s+)?[a-zA-Z_][a-zA-Z\d_]*(<[a-zA-Z\d_.-<>]*>)?(\s+requires\s+[a-zA-Z_<>][a-zA-Z\d_<>]*)?(\s*=\s*[a-zA-Z\d_.-<>][a-zA-Z\d_.-<>]*)?$/.test(item)) {
                throw new SyntaxError(`Invalid syntax for template: ${item}`);
            };
            let requiresClause = item.match(/(?<=\s+requires\s+)[a-zA-Z_<>][a-zA-Z\d_<>]*(?=(\s*=\s*[a-zA-Z\d_.-<>][a-zA-Z\d_.-<>]*)?$)/)?.[0];
            if (requiresClause) requires.push(requiresClause);
    
            let isClass = /^class\s+[a-zA-Z_][a-zA-Z\d_]*/.test(item);
            let isTemplateClass = isClass && />$/.test(item);
            if (isTemplateClass) {
                let template = item.match(/(?<=^class\s+[a-zA-Z_][a-zA-Z\d_]*)<[a-zA-Z\d_.-<>]*>$/)?.[0];
                if (!template) throw new SyntaxError(`Invalid syntax for template: ${item}`);
                let decl = item.replace(template, '');
                output += `template${template} ${decl}`;
            } else if (isClass) {
                output += item;
            } else {
                let isTypename = /^[a-zA-Z_][a-zA-Z\d_]*(<[a-zA-Z\d_.-<>]*>)?(\s+requires\s+[a-zA-Z_<>][a-zA-Z\d_<>]*)?(\s*=\s*[a-zA-Z\d_.-<>][a-zA-Z\d_.-<>]*)?$/.test(item);
                if (isTypename) output += 'typename ';
                let defaultValue = item.match(/(?<=\s*=\s*)[a-zA-Z\d_.-<>][a-zA-Z\d_.-<>]*$/)?.[0];
                let name = isTypename ? item.match(/^[a-zA-Z_][a-zA-Z\d_]*/)?.[0] : item.match(/^[a-zA-Z_][a-zA-Z\d_]*\s+[a-zA-Z_][a-zA-Z\d_]*/)?.[0];
                if (!name) throw new SyntaxError(`Invalid syntax for template: ${item}`);
                output += name;
                if (defaultValue) output += ' = ' + defaultValue;
            };
            if (!isLast) output += ', ';
        };
        output += '>\n';
        if (requires.length > 0) {
            output += `requires ${requires.join(' && ')}\n`;
        };
        output += declaration.replace('<' + providedTemplate + '>', '');
        return output;
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

    const tokens = getTokens(c6Code);
    for (let func in customFunctionMap) {
        const matched = searchFunction(tokens, func, 'c6');
        if (matched) {
            namespaceCode += constructCPPFunction(func);
        };
    };

    namespaceCode += '\n};\n';
    c6Code = namespaceCode + c6Code;

    const requiredHeaders = Array.from(getRequiredHeaders(getTokens(c6Code)));
    const headersOutput = requiredHeaders.map(header => `#include ${header}`).join('\n') + '\n' + c6Code;

    const templates = headersOutput.replace(/\bclass [a-zA-Z\d_]+\s*<[^\n]*>\s*{/g, t => {
        return constructTemplate(t);
    });

    const lambdas = templates.replace(/\bfn(?=\()/, '[&]');

    const output = lambdas;

    const fileName = path.basename(trimmed);
    const dirName = path.dirname(trimmed);

    fs.writeFileSync(path.join(dirName, fileName.replace(/\.c6$/, '.cpp')), output);
};

if (args.length == 0) {
    console.log(`
C6 COMPILER HELP - VERSION 1.2.0

c6 <filepath> - Compiles the file at <filepath> to a C++ file of the same name in the same directory.
\x1b[38;5;240mNote: Compiler does not have an error checker. If the C6 code has an error, it may still compile.\x1b[0m
c6 [\x1b[38;5;240m-d\x1b[0m|\x1b[38;5;240m--docs\x1b[0m] - Will log the documentations for the functions that are provided under the C6 namespace.
c6 [\x1b[38;5;240m-v\x1b[0m|\x1b[38;5;240m--version\x1b[0m] - Will log the current version of C6.
c6 \x1b[38;5;240m--benchmark\x1b[0m <filepath> - Will compile the file at <filepath> and log how long it took to compile.
    `);
    process.exit(0);
} else {
    if (args[0] == '--docs' || args[0] == '-d') {
        console.log(`
\x1b[1mfloat c6::randfloat(const float min, const float max)\x1b[0m
Generates a random float between the min and the max values then returns it.

\x1b[1mint c6::randint(const int min, const int max)\x1b[0m
Generates a random integer between the min and the max values then returns it.

\x1b[1mvoid c6::write_file(const std::string& path, const std::string& contents, const bool overwrite = true)\x1b[0m
Writes the contents to the file at the provided path. Overwrite is optional and determines whether to overwrite
the file or append to it. If there is no file at the provided path it will raise a std::runtime_error.

\x1b[1mstd::string c6::read_file(const std::string& path)\x1b[0m
Gets the contents of the file at the provided path and returns them. If there is no file at the provided
path it will raise a std::runtime_error.

\x1b[1mvoid c6::println(const T... text)\x1b[0m
Prints the provided text to the console with an automatic newline. The text can be a variety of types, including
std::string, int, long, double, float, and other primitive types.

\x1b[1mstd::string c6::input(const T& text)\x1b[0m
Prints the provided text to the console and waits for user input. Once it recieves user input, it will return it as a std::string.

\x1b[1mint c6::to_int(const std::string& value)\x1b[0m
Attempts to convert the std::string value to an int then return it. If it fails, it will throw a std::runtime_error.

\x1b[1mstd::string c6::to_string(const T value)\x1b[0m
Will convert any primitive type to a string (int, float, double, long, bool, etc).

Please review the GitHub page for details on other aspects of C6!
        `);
        process.exit(0);
    };
    if (args[0] == '--version' || args[0] == '-v') {
        console.log('C6 Version 1.2.0');
        process.exit(0);
    };
    if (args[0] == '--benchmark') {
        if (!args[1]) {
            console.log('You must specify a file path!');
            process.exit(1);
        };
        const start = performance.now();
        console.log('Compiling C6...');
        compile(args[1]);
        console.log('Compilation successful!');
        console.log('[BENCHMARK] Time took: ' + (Math.round((performance.now() - start) * 10000) / 10000) + 'ms!');
        process.exit(0);
    };
    console.log('Compiling C6...');
    compile(args[0]);
    console.log('Compilation successful!');
    process.exit(0);
};