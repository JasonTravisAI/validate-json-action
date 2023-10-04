// Load node modules
import fs from 'fs/promises';

// Load additional modules
import Ajv2020 from 'ajv/dist/2020.js';
import core from '@actions/core';
import glob from '@actions/glob';
import styles from 'ansi-styles';


const main = async (): Promise<void> => {

	// Load action inputs variables
	const patternInput = core.getInput('pattern');

	// Load path to the checked out repository
	const repositoryPath = process.env.GITHUB_WORKSPACE;

	if (!repositoryPath){
		throw Error("GITHUB_WORKSPACE path is not set")
	}

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
	for await (const schemaPath of globber.globGenerator()) {
		// Load JSON file as a string
		const schemaString = await fs.readFile(schemaPath, 'utf-8');

		// Parse the JSON string to an Object so the validator could handle it
		const schemaObject = JSON.parse(schemaString);

		// Init Ajv schema validator
		const validator = new Ajv2020({
			allErrors: true // Collect all validation errors
		});

		let validateSchema

		try {
			validateSchema = validator.compile(schemaObject);
		} catch (error) {
			console.log(`Schema validation failed for file ${schemaPath}, with error: ${error}`)
		}

		// Define relative JSON file path
		const schemaPathRelative = schemaPath.replace(repositoryPath, '');

		// Print the validation results
		if (validateSchema) {
			core.info(`${styles.green.open}✔ file ${schemaPathRelative} is valid${styles.green.close}`);
		} else {
			core.info(`${styles.red.open}✖︎ file ${schemaPathRelative} is invalid${styles.red.close}`);
			errorsCounter++;
		}
	}

	// Fail the task run in case of any error
	if (errorsCounter) {
		core.setFailed(`There are ${errorsCounter} invalid files`);
	}

}

main();


