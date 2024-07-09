/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/crave/Incident_Management/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});