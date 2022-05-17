const Problem = require("../models/problem.model");

const addProblem = async (req, res, next) => {
	const { description, key, type } = req.body;
	const associatedFile = req.file.filename;

	const { error } = validation.addProblemValidation({
		description,
		key,
		type,
	});
	if (error) return next(error.details[0].message);

	if (!associatedFile) {
		associatedFile = "";
	}

	try {
		const problem = new Problem({
			description,
			key,
			associatedFile,
			type,
		});
		await problem.save();
		res.json({ message: "Problem added successfully" });
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	createProblem: addProblem,
};
