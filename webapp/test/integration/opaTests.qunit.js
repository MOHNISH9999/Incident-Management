/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/crave/Incident_Management/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});