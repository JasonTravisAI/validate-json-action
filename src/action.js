// Load node modules
import fs from 'node:fs/promises';

// Load additional modules
import Ajv from 'ajv';
import core from '@actions/core';
import glob from '@actions/glob';
import styles from 'ansi-styles';

// Load action inputs variables
const patternInput = core.getInput('pattern');

// Load path to the checked out repository
const repositoryPath = process.env.GITHUB_WORKSPACE;

// Get all jsons paths
const globber = await glob.create(patternInput, {
	followSymbolicLinks: false,
	implicitDescendants: false,
	matchDirectories: false,
	omitBrokenSymbolicLinks: true
});

// Define errors counter so we can return correct exit code
let errorsCounter = 0;

// Validate each file according to schema
for await (const jsonPath of globber.globGenerator()) {
	// Load JSON file as a string
	const schemaString = await fs.readFile(jsonPath, 'utf-8');

	// Parse the JSON string to an Object so the validator could handle it
	const schemaObject = JSON.parse(schemaString);

	// Init Ajv schema validator
	const validator = new Ajv({
		$data: true, // Enable $data support for draft-07
    	allErrors: true // Collect all validation errors
	});
	const validateSchema = validator.compile(schemaObject);

	const schemaVersion = schemaObject["$schema"];

	// Validate the file according to given schema
	const validationResult = validateSchema({ "$ref": schemaVersion });

	// Define relative JSON file path
	const schemaPathRelative = jsonPath.replace(repositoryPath, '');

	// Print the validation results
	if (validationResult) {
		core.info(`${styles.green.open}✔ file ${schemaPathRelative} is valid${styles.green.close}`);
	} else {
		core.info(`${styles.red.open}✖︎ file ${schemaPathRelative} is invalid${styles.red.close}`);
		errorsCounter++;
	}

	// Print details from the validator
	if (validateSchema.errors) {
		core.startGroup('Validation details');
		core.info(JSON.stringify(validateSchema.errors, null, 2));
		core.endGroup();
	}
}

// Fail the task run in case of any error
if (errorsCounter) {
	core.setFailed(`There are ${errorsCounter} invalid files`);
}
