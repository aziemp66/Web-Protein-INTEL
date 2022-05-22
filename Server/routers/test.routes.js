const router = require("express").Router();
const testController = require("../controllers/test.controller");

router.post("/", testController.startTest);

router.patch("/", testController.saveTest);

router.get("/", testController.findTest);

router.post("/end", testController.endTest);

module.exports = router;