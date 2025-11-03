const fs = require('fs');

/**
 * Extract reference numbers from response data
 * This script can handle various response formats and extract reference numbers
 */

// Function to extract reference numbers from different data structures
function extractReferenceNumbers(data, options = {}) {
    const referenceNumbers = [];
    const {
        fields = ['referenceNumber', 'reference', 'refNumber', 'ref', 'id', '_id', 'number'],
        caseSensitive = false,
        includeNested = true
    } = options;

    // Convert fields to lowercase if case insensitive
    const searchFields = caseSensitive ? fields : fields.map(f => f.toLowerCase());

    function searchObject(obj, path = '') {
        if (obj === null || obj === undefined) return;

        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                searchObject(item, `${path}[${index}]`);
            });
        } else if (typeof obj === 'object') {
            Object.keys(obj).forEach(key => {
                const keyToCheck = caseSensitive ? key : key.toLowerCase();
                const currentPath = path ? `${path}.${key}` : key;

                // Check if current key matches any reference field
                if (searchFields.some(field => keyToCheck.includes(field))) {
                    const value = obj[key];
                    if (value !== null && value !== undefined) {
                        referenceNumbers.push({
                            path: currentPath,
                            key: key,
                            value: value.toString(),
                            type: typeof value
                        });
                    }
                }

                // Continue searching nested objects if enabled
                if (includeNested && typeof obj[key] === 'object') {
                    searchObject(obj[key], currentPath);
                }
            });
        }
    }

    searchObject(data);
    return referenceNumbers;
}

// Function to extract reference numbers from response string/JSON
function processResponse(responseData, options = {}) {
    try {
        let data;
        
        // Handle different input types
        if (typeof responseData === 'string') {
            try {
                data = JSON.parse(responseData);
            } catch (e) {
                // If not JSON, try to extract numbers from string
                const numberPattern = /\b\d{6,}\b/g; // Extract numbers with 6+ digits
                const matches = responseData.match(numberPattern);
                return matches ? matches.map(match => ({
                    path: 'string_extraction',
                    key: 'extracted_number',
                    value: match,
                    type: 'string'
                })) : [];
            }
        } else {
            data = responseData;
        }

        return extractReferenceNumbers(data, options);
    } catch (error) {
        console.error('Error processing response:', error.message);
        return [];
    }
}

// Main execution function
function main() {
    // Check if response file is provided as argument
    const responseFile = process.argv[2];
    
    if (!responseFile) {
        console.log('Usage: node extract_reference_numbers.js <response_file>');
        console.log('Or modify the script to include your response data directly');
        
        // Example usage with sample data
        console.log('\nExample with sample data:');
        const sampleResponse = {
            status: 'success',
            data: {
                transaction: {
                    referenceNumber: 'REF123456789',
                    id: 'TXN001',
                    items: [
                        { reference: 'ITEM001' },
                        { reference: 'ITEM002' }
                    ]
                }
            }
        };
        
        const results = processResponse(sampleResponse);
        console.log('Found reference numbers:', results);
        return;
    }

    try {
        // Read response from file
        console.log(`Reading response from: ${responseFile}`);
        const responseData = fs.readFileSync(responseFile, 'utf8');
        
        // Extract reference numbers
        const referenceNumbers = processResponse(responseData, {
            fields: ['referenceNumber', 'reference', 'refNumber', 'ref', 'id', '_id', 'number', 'confirmationNumber'],
            caseSensitive: false,
            includeNested: true
        });

        console.log(`\nFound ${referenceNumbers.length} reference numbers:`);
        console.log('================================================');
        
        referenceNumbers.forEach((ref, index) => {
            console.log(`${index + 1}. Path: ${ref.path}`);
            console.log(`   Key: ${ref.key}`);
            console.log(`   Value: ${ref.value}`);
            console.log(`   Type: ${ref.type}`);
            console.log('');
        });

        // Save results to file
        const outputFile = responseFile.replace(/\.[^/.]+$/, '') + '_reference_numbers.json';
        fs.writeFileSync(outputFile, JSON.stringify(referenceNumbers, null, 2));
        console.log(`Results saved to: ${outputFile}`);

        // Also save just the values for easy copying
        const valuesOnly = referenceNumbers.map(ref => ref.value);
        const valuesFile = responseFile.replace(/\.[^/.]+$/, '') + '_reference_values.txt';
        fs.writeFileSync(valuesFile, valuesOnly.join('\n'));
        console.log(`Reference values saved to: ${valuesFile}`);

    } catch (error) {
        console.error('Error reading file:', error.message);
    }
}

// Export functions for use as module
module.exports = {
    extractReferenceNumbers,
    processResponse
};

// Run main function if script is executed directly
if (require.main === module) {
    main();
}
