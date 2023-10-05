import { readFile } from 'fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import * as core from '@actions/core';
import fastglob from 'fast-glob';
import styles from 'ansi-styles';

const main = async (): Promise<void> => {
	// Load action inputs variables
	const patternInput = core.getInput('pattern');

	// Load path to the checked out repository
	const repositoryPath = process.env.GITHUB_WORKSPACE;

	if (!repositoryPath) {
		throw Error('GITHUB_WORKSPACE path is not set');
	}

	// Define errors counter so we can return correct exit code
	let errorsCounter = 0;

	const schemaPaths = await fastglob(patternInput);

	schemaPaths.forEach(async (schemaPath) => {
		// Load JSON file as a string
		const schemaString = await readFile(schemaPath, 'utf-8');

		// Parse the JSON string to an Object so the validator could handle it
		const schemaObject = JSON.parse(schemaString);

		// Init Ajv schema validator
		const validator = new Ajv2020({
			allErrors: true // Collect all validation errors
		});

		let validateSchema;

		try {
			validateSchema = validator.compile(schemaObject);
		} catch (error) {
			core.error(`Schema validation failed for file ${schemaPath}, with error: ${error}`);
		}

		// Define relative JSON file path
		const schemaPathRelative = schemaPath.replace(repositoryPath, '');

		// Print the validation results
		if (validateSchema) {
			core.info(
				`${styles.green.open}✔ file ${schemaPathRelative} is valid${styles.green.close}`
			);
		} else {
			core.info(
				`${styles.red.open}✖︎ file ${schemaPathRelative} is invalid${styles.red.close}`
			);
			errorsCounter += 1;
		}
	});

	// Fail the task run in case of any error
	if (errorsCounter) {
		core.setFailed(`There are ${errorsCounter} invalid files`);
	}
};

main();
