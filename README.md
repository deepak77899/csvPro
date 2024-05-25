# CSVPro - One Stop solution for csv
***CSV to JSON Conversion :***  Convert CSV files to JSON format, with support for:
- Custom delimiters.
- Preserving data types (integers, floats, booleans, dates, nulls).
- andling missing values.
- Trimming whitespace.
- Custom type mapping for specific columns.
- Chunk processing for efficient handling of large files.

***Duplicate Row Detection :***  Identify and retrieve duplicate rows from a dataset.

***Row Filtering :*** Filter rows in a dataset based on custom conditions.

***Row Sorting :*** Sort rows in a dataset based on a specified key (column), in ascending or descending order.

***Row Grouping :*** Group rows in a dataset by a specified key (column), returning an object with grouped rows.

```sh
$ npm install csvPro 
```

```js
import { csvToJson, checkDuplicateRows, filterRows, sortRows, groupBy ,countValues, sumValues, averageValues, minValue, maxValue} from 'csvPro';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to a file path

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'demo2.csv');

const options = {
    delimiter: ',', // Custom delimiter
    defaultValue: 'N/A', // Default value for missing entries
    trimWhitespace: true, // Trim whitespace
    preserveTypes: true, // Preserve data types
    customTypeMapping: { // Custom type mapping
        rollNo: (value) => parseInt(value, 10),
        weight: (value) => parseFloat(value),
    },
    chunkSize: 1000 // Process 1000 rows at a time
};

const jsonData = await csvToJson(filePath, options);
console.log('JSON Data:', jsonData);

const duplicates = checkDuplicateRows(jsonData);
console.log('Duplicate Rows:', duplicates);

const filteredData = filterRows(jsonData, row => row.age > 18);
console.log('Filtered Data:', filteredData);

const sortedData = sortRows(jsonData, 'score', false);
console.log('Sorted Data:', sortedData);

const groupedData = groupBy(jsonData, 'class');
console.log('Grouped Data:', groupedData);

// Aggregation Examples
const ageCounts = countValues(jsonData, 'age');
console.log('Age Counts:', ageCounts);

const totalScore = sumValues(jsonData, 'score');
console.log('Total Score:', totalScore);

const averageScore = averageValues(jsonData, 'score');
console.log('Average Score:', averageScore);

const minScore = minValue(jsonData, 'score');
console.log('Min Score:', minScore);

const maxScore = maxValue(jsonData, 'score');
console.log('Max Score:', maxScore);
```