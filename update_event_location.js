const { ObjectId } = require('mongodb');
// OR if using mongoose: const { ObjectId } = require('mongoose').Types;

const chargeTemplatesFile = require("./tmx-migration/rate-engine.chargetemplates.json");
const rateRecordsFile = require("./tmx-migration/rate-engine.raterecords.json");
const fs = require("fs");

// First, create a map of name to eventLocationRule for charge templates
const chargeTemplateMap = new Map();

// Process charge templates and store in map
const updatedChargeTemplates = chargeTemplatesFile.map(template => {
    const newObjectId = new ObjectId(); // Generate proper MongoDB ObjectId
    const updatedTemplate = {
        ...template,
        eventLocationRule: {
            event: "DELIVERLOAD",
            _id: {
                "$oid": newObjectId.toString() // Convert to string format
            }
        }
    };
    // Store in map with name as key
    chargeTemplateMap.set(template.name, updatedTemplate.eventLocationRule);
    return updatedTemplate;
});

// Process rate records using the map
const updatedRateRecords = rateRecordsFile.map(record => {
    // Update chargeProfiles within each charge group
    const updatedChargeGroups = record.chargeGroups.map(group => {
        const updatedChargeProfiles = group.chargeProfiles.map(profile => {
            // Get the corresponding eventLocationRule using profile name
            const matchingEventLocationRule = chargeTemplateMap.get(profile.name);

            if (!matchingEventLocationRule) {
                console.warn(`Warning: No matching charge template found for profile with name: ${profile.name}`);
                return profile;
            }

            return {
                ...profile,
                eventLocationRule: matchingEventLocationRule
            };
        });

        return {
            ...group,
            chargeProfiles: updatedChargeProfiles
        };
    });

    return {
        ...record,
        chargeGroups: updatedChargeGroups
    };
});

// Write back the updated data with new filenames to preserve originals
fs.writeFileSync(
    "./tmx-migration/updated-chargetemplates.json", 
    JSON.stringify(updatedChargeTemplates, null, 2)
);

fs.writeFileSync(
    "./tmx-migration/updated-raterecords.json",
    JSON.stringify(updatedRateRecords, null, 2)
);

console.log("Successfully added eventLocationRule to both collections!");