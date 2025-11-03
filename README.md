# Event Location Rule Adder

A Node.js migration tool designed to add `eventLocationRule` fields to charge templates and rate records for MongoDB database updates.

## Description

This tool performs data migration on JSON exports by:
- Adding `eventLocationRule` objects with event "DELIVERLOAD" to charge templates
- Mapping charge templates to rate records by name
- Updating rate records with corresponding event location rules
- Generating updated JSON files ready for MongoDB import

## Features

- **Automatic Event Location Rule Assignment**: Adds event location rules to charge templates with generated MongoDB ObjectIds
- **Template-to-Rate Mapping**: Intelligently matches charge templates to rate records by name
- **Reference Number Extraction**: Utility script to extract reference numbers from complex nested JSON structures
- **Safe File Handling**: Preserves original files while creating updated versions

## Prerequisites

- Node.js (v12 or higher)
- npm or yarn
- MongoDB (for database import if needed)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Kushalbaj/add-event-location.git
cd add-event-location
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Main Migration Script

Run the main script to add event location rules to charge templates and rate records:

```bash
node update_event_location.js
```

This script will:
1. Read charge templates from `tmx-migration/rate-engine.chargetemplates.json`
2. Read rate records from `tmx-migration/rate-engine.raterecords.json`
3. Add `eventLocationRule` fields to charge templates
4. Map and update corresponding rate records
5. Write updated files:
   - `tmx-migration/updated-chargetemplates.json`
   - `tmx-migration/updated-raterecords.json`

### Reference Number Extraction Utility

Extract reference numbers from JSON files:

```bash
node extract_reference_numbers.js <path-to-json-file>
```

Example:
```bash
node extract_reference_numbers.js raterecords-example.json
```

The script will:
- Search for reference numbers in nested JSON structures
- Extract values from fields like: `referenceNumber`, `reference`, `refNumber`, `ref`, `id`, `_id`, `number`, `confirmationNumber`
- Output results to:
  - `*_reference_numbers.json` - Detailed results with paths
  - `*_reference_values.txt` - Plain list of reference values

