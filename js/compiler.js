// Global state
let lexicalPassed = false;
let syntaxPassed = false;
let semanticPassed = false;
let literalInput = "";
let tokenList = "";

// Constants
const TOKENS = {
    ASSIGN: '=',
    SEMICOLON: ';',
    DATA_TYPES: ['int', 'double', 'char', 'String', 'boolean'],
    PATTERNS: {
        INTEGER: /^-?\d+$/,
        STRING: /^"[^"]*"$/,
        CHAR: /^'.'$/,
        DOUBLE: /^-?\d+(\.\d+)?$/,
        IDENTIFIER: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/,
        BOOLEAN: /^(true|false)$/
    }
};

// Get DOM elements
const codeInput = document.getElementById('codeInput');
const output = document.getElementById('output');
const lexicalBtn = document.getElementById('lexicalBtn');
const syntaxBtn = document.getElementById('syntaxBtn');
const semanticBtn = document.getElementById('semanticBtn');
const clearBtn = document.getElementById('clearBtn');
const openFileBtn = document.getElementById('openFileBtn');

// Event listeners
openFileBtn.addEventListener('click', openFile);
lexicalBtn.addEventListener('click', lexicalAnalyzer);
syntaxBtn.addEventListener('click', syntaxAnalyzer);
semanticBtn.addEventListener('click', semanticAnalyzer);
clearBtn.addEventListener('click', clearAll);

// upload file
function openFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.java';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            codeInput.value = event.target.result;
            enableButton(lexicalBtn);
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// lexical analyzer
function lexicalAnalyzer() {
    const code = codeInput.value.trim();
    if (!code) {
        showOutput('Please enter some code');
        return;
    }

    literalInput = '';
    tokenList = '';
    let isValid = true;

    function tokenize(line) {
        const tokens = [];
        const words = line.split(/\s+/); // Split line into words by whitespace
        
        for (const word of words) {
            if (!word) continue; // Skip empty strings
            
            if (TOKENS.DATA_TYPES.includes(word)) { // Check if it's a valid data type
                tokens.push({ type: 'data_type', value: word });
            } else if (word === TOKENS.ASSIGN) { // Check if it's an assignment operator
                tokens.push({ type: 'assignment_operator', value: word });
            } else if (word === TOKENS.SEMICOLON) { // Check if it's a semicolon (delimiter)
                tokens.push({ type: 'delimiter', value: word });
            } else if (TOKENS.PATTERNS.INTEGER.test(word)) { // Check if it's an integer value
                tokens.push({ type: 'integer', value: word });
            } else if (TOKENS.PATTERNS.DOUBLE.test(word)) { // Check if it's a double value
                tokens.push({ type: 'double', value: word });
            } else if (TOKENS.PATTERNS.STRING.test(word)) { // Check if it's a string value
                tokens.push({ type: 'string', value: word });
            } else if (TOKENS.PATTERNS.CHAR.test(word)) { // Check if it's a char value
                tokens.push({ type: 'char', value: word });
            } else if (TOKENS.PATTERNS.BOOLEAN.test(word)) { // Check if it's a boolean value
                tokens.push({ type: 'boolean', value: word });
            } else if (TOKENS.PATTERNS.IDENTIFIER.test(word)) { // Check if it's a valid identifier
                tokens.push({ type: 'identifier', value: word });
            } else {
                // If none of the above, it's an invalid token
                showOutput(`Invalid token found: "${word}"`);
                return null;
            }
        }
        return tokens;
    }

    if (isValid) {
        lexicalPassed = true;
        showOutput('LEXICAL ANALYSIS PASSED');
        enableButton(syntaxBtn);
        disableButton(lexicalBtn);
    } else {
        showOutput('LEXICAL ANALYSIS FAILED');
        disableButton(syntaxBtn);
        disableButton(semanticBtn);
    }
}

//syntax analyzer
function syntaxAnalyzer() {
    if (!lexicalPassed) {
        showOutput('Please complete lexical analysis first');
        return;
    }

    const lines = tokenList.split('\n').filter(line => line.trim());
    let isValid = true;

    for (const line of lines) {
        // Check each line of tokens
        const tokens = line.split('|').filter(token => token.trimEnd());
        if (tokens.length === 5 && validatePattern(tokens, 'data_type','identifier','assignment_operator','value','delimiter')) {
            continue;
        } else if (tokens.length === 3 && validatePattern(tokens, 'data_type', 'identifier', 'delimiter')) {
                continue; // Syntax is valid for this pattern
        } else {
            isValid = false;
            break;
        }
    }

    if (isValid) {
        syntaxPassed = true;
        showOutput('SYNTAX ANALYSIS PASSED');
        enableButton(semanticBtn);
        disableButton(syntaxBtn);
    } else {
        showOutput('SYNTAX ANALYSIS FAILED');
        disableButton(semanticBtn);
    }
}

//semantic analyzer
function semanticAnalyzer() {
    if (!syntaxPassed) {
        showOutput('Please complete syntax analysis first');
        return;
    }

    let isValid = true;

    for (const line of tokenList.split('\n').filter(line => line.trim())) {
        const tokens = line.split('|').filter(token => token.trim()); // Extract tokens
        if (tokens.length >= 4) {
            const [data_type, identifier, assignmment_operator, value] = tokens;

            if (assignmment_operator === '=') {
                if (!isValueMatchingType(data_type, value)) {
                    showOutput(`Semantic Error: ${value} is not valid for type ${data_type}`);
                    isValid = false;
                    break;
                }
            } else {
                showOutput(`Semantic Error: Missing or invalid assignment operator for ${identifier}`);
                isValid = false;
                break;
            }
        } else if (tokens.length === 3) {
            const [data_type, identifier, delimiter] = tokens;
            if (delimiter !== ';') {
                showOutput(`Semantic Error: Missing semicolon for ${identifier}`);
                isValid = false;
                break;
            }
        } else {
            showOutput(`Semantic Error: Invalid line format "${line}"`);
            isValid = false;
            break;
        }
    }

    if (isValid) {
        semanticPassed = true;
        showOutput('SEMANTIC ANALYSIS PASSED');
        disableButton(semanticBtn);
    } else {
        showOutput('SEMANTIC ANALYSIS FAILED');
    }
}

//helper functions
function tokenize(line) {
    const tokens = [];
    const words = line.split(/\s+/);
    
    for (const word of words) {
        if (!word) continue;
        
        if (TOKENS.DATA_TYPES.includes(word)) {
            tokens.push({ type: 'data_type', value: word });
        } else if (word === TOKENS.ASSIGN) {
            tokens.push({ type: 'assignment_operator', value: word });
        } else if (word === TOKENS.SEMICOLON) {
            tokens.push({ type: 'delimiter', value: word });
        } else if (isValue(word)) {
            tokens.push({ type: 'value', value: word });
        } else if (TOKENS.PATTERNS.IDENTIFIER.test(word)) {
            tokens.push({ type: 'identifier', value: word });
        } else {
            return null; // Invalid token found
        }
    }
    
    return tokens;
} 

function isValue(word) {
    return (
        TOKENS.PATTERNS.INTEGER.test(word) ||
        TOKENS.PATTERNS.STRING.test(word) ||
        TOKENS.PATTERNS.CHAR.test(word) ||
        TOKENS.PATTERNS.DOUBLE.test(word) ||
        TOKENS.PATTERNS.BOOLEAN.test(word)
    );
}

function isValueMatchingType(dataType, value) {
    switch (dataType) {
        case 'int': return TOKENS.PATTERNS.INTEGER.test(value);
        case 'double': return TOKENS.PATTERNS.DOUBLE.test(value);
        case 'char': return TOKENS.PATTERNS.CHAR.test(value);
        case 'String': return TOKENS.PATTERNS.STRING.test(value);
        case 'boolean': return TOKENS.PATTERNS.BOOLEAN.test(value);
        default: return false;
    }
}

function validatePattern(tokens, ...expectedTypes) {
    return expectedTypes.every((type, index) => tokens[index] === type);
}

function clearAll() {
    codeInput.value = '';
    showOutput('');
    lexicalPassed = syntaxPassed = semanticPassed = false;
    literalInput = tokenList = '';
    disableButton(syntaxBtn);
    disableButton(semanticBtn);
    enableButton(lexicalBtn);
}

function showOutput(message) {
    output.textContent = message;
}

function enableButton(button) {
    button.disabled = false;
}

function disableButton(button) {
    button.disabled = true;
}
