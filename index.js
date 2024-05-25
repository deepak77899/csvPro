import fs from 'fs';
import readline from 'readline';

// Function to parse a line of CSV, handling special characters and quoted strings
function parseCsvLine(line, delimiter) {
    const regex = new RegExp(`(?:^|${delimiter})(\"(?:(?:(?!\").)*\"|\"\")*\"|[^${delimiter}]*)`, 'g');
    const values = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
        let value = match[0];
        if (value.startsWith(delimiter)) value = value.slice(1);
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1).replace(/""/g, '"');
        }
        values.push(value);
    }
    return values;
}

// Function to convert CSV to JSON with various options and chunk processing
export function csvToJson(filePath, options = {}) {
    return new Promise((resolve, reject) => {
        const results = [];
        const inputStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: inputStream,
            crlfDelay: Infinity
        });

        let headers = [];
        let chunk = [];
        let buffer = '';

        rl.on('line', (line) => {
            const delimiter = options.delimiter || ',';

            // Check for newlines within quoted strings
            if ((line.match(new RegExp(`"${delimiter}`, 'g')) || []).length % 2 !== 0) {
                buffer += line + '\n';
                return;
            } else if (buffer.length > 0) {
                line = buffer + line;
                buffer = '';
            }

            const values = parseCsvLine(line, delimiter);

            if (headers.length === 0) {
                headers = values;
            } else {
                const obj = {};
                headers.forEach((header, index) => {
                    let value = values[index];

                    // Apply options for preserving data types
                    if (options.preserveTypes) {
                        if (value !== undefined && !isNaN(value) && value.trim() !== '') {
                            if (value.includes('.')) {
                                value = parseFloat(value);
                            } else {
                                value = parseInt(value, 10);
                            }
                        } else if (value !== undefined && value.trim().toLowerCase() === 'true') {
                            value = true;
                        } else if (value !== undefined && value.trim().toLowerCase() === 'false') {
                            value = false;
                        } else if (value !== undefined && !isNaN(Date.parse(value))) {
                            value = new Date(value);
                        } else if (value !== undefined && (value.trim().toLowerCase() === 'null' || value.trim() === '')) {
                            value = null;
                        }
                    }

                    // Apply options for handling missing values
                    if (options.defaultValue !== undefined && (value === undefined || value === '')) {
                        value = options.defaultValue;
                    }

                    // Trim whitespace if flag is set
                    if (value !== undefined && options.trimWhitespace) {
                        value = String(value).trim();
                    }

                    // Apply custom type mappings if provided
                    if (options.customTypeMapping && options.customTypeMapping[header]) {
                        value = options.customTypeMapping[header](value);
                    }

                    obj[header] = value;
                });
                chunk.push(obj);

                // Process chunk if it reaches the specified size
                if (chunk.length >= options.chunkSize) {
                    results.push(...chunk);
                    chunk = [];
                }
            }
        });

        rl.on('close', () => {
            if (chunk.length > 0) {
                results.push(...chunk);
            }
            resolve(results);
        });

        rl.on('error', (error) => {
            reject(error);
        });
    });
}

// Function to check for duplicate rows
export function checkDuplicateRows(data) {
    const uniqueRows = new Set();
    const duplicates = [];

    data.forEach(row => {
        const rowString = JSON.stringify(row);
        if (uniqueRows.has(rowString)) {
            duplicates.push(row);
        } else {
            uniqueRows.add(rowString);
        }
    });

    return duplicates;
}

// Function to filter rows based on a condition
export function filterRows(data, condition) {
    return data.filter(row => condition(row));
}

// Function to sort rows based on a key
export function sortRows(data, key, ascending = true) {
    return data.sort((a, b) => {
        if (a[key] < b[key]) return ascending ? -1 : 1;
        if (a[key] > b[key]) return ascending ? 1 : -1;
        return 0;
    });
}

// Function to group rows by a key
export function groupBy(data, key) {
    return data.reduce((result, row) => {
        const group = row[key];
        if (!result[group]) result[group] = [];
        result[group].push(row);
        return result;
    }, {});
}
