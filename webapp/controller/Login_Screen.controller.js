sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("com.crave.Incident_Management.controller.Login_Screen", {
		onInit: function () {
			// Load the user data from the JSON file
			var oUserModel = new JSONModel();
			oUserModel.loadData("./model/user.json");
			console.log("Loaded user data:", oUserModel.getData());
			this.getView().setModel(oUserModel, "userModel");
		},

		onInputChange: function (oEvent) {
			// Handle input change if necessary
		},

		onLogin: function () {
			var oView = this.getView();
			var sUsername = oView.byId("usernameInput").getValue();
			var sPassword = oView.byId("passwordInput").getValue();
			var oUserModel = oView.getModel("userModel");

			// Log to check the values of username and password
			console.log("Username:", sUsername);
			console.log("Password:", sPassword);

			// Log to check if the user model is loaded
			if (!oUserModel) {
				console.error("User model is not loaded.");
				MessageToast.show("User model is not loaded. Please try again.");
				return;
			}

			// Correctly get the user data from the model
			var aUsers = oUserModel.getData(); // Directly use the data from the model

			// Log to check the user data
			console.log("Loaded user data:", aUsers);

			// Authenticate the user
			var bAuthenticated = aUsers.some(function (user) {
				return user.username === sUsername && user.password === sPassword;
			});

			if (bAuthenticated) {
				MessageToast.show("Login successful");
				console.log("Login successful for user:", sUsername);

				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Incident_List", {username: sUsername});
				// Navigate to the next page or perform additional actions
			} else {
				MessageToast.show("Invalid username or password");
				console.log("Login failed for user:", sUsername);
			}
			
			// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// 	oRouter.navTo("Incident_List", {username: sUsername});
		}
	});

});