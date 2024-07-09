sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/Image",
	"sap/m/Button"
], function (Controller, JSONModel, MessageToast, Dialog, Image, Button) {
	"use strict";
	return Controller.extend("com.crave.Incident_Management.controller.Incident_List", {
		formatter: {
			formatDateTime: function (dateTime) {
				// Assuming dateTime is in ISO format (e.g., "2023-06-11T10:30:00Z")
				let oDate = new Date(dateTime);
				let options = {
					year: "numeric",
					month: "long",
					day: "numeric",
					// hour: "numeric",
					// minute: "numeric",
					// second: "numeric"
				};
				return oDate.toLocaleString(undefined, options);
			}
		},
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("Incident_List").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			var sUsername = oEvent.getParameter("arguments").username;
			this._loadIncidentData(sUsername);
		},
		onImagePress: function (oEvent) {
			var sImageSrc = oEvent.getSource().getSrc();
			if (!this._oImageDialog) {
				this._oImageDialog = new Dialog({
					title: "Preview",
					contentWidth: "90%",
					contentHeight: "40%",
					content: new Image({
						src: sImageSrc,
						width: "100%",
						height: "100%"
					}),
					endButton: new Button({
						text: "Close",
						press: function () {
							this._oImageDialog.close();
						}.bind(this)
					})
				});
				this.getView().addDependent(this._oImageDialog);
			} else {
				this._oImageDialog.getContent()[0].setSrc(sImageSrc);
			}
			this._oImageDialog.open();
		},

		_loadIncidentData: function (sUsername) {
			var oIncidentModel = this.getOwnerComponent().getModel("incidentDataModel");

			if (!oIncidentModel) {
				oIncidentModel = new JSONModel();
				oIncidentModel.loadData("./model/incident.json", null, false);
				this.getOwnerComponent().setModel(oIncidentModel, "incidentDataModel");
			}

			var aIncidents = oIncidentModel.getProperty("/incident");
			var aFilteredIncidents = aIncidents.filter(function (incident) {
				return incident.username === sUsername;
			});

			var oFilteredIncidentModel = new JSONModel({
				incident: aFilteredIncidents,
				pageTitle: "Incidents (" + aFilteredIncidents.length + ")"
			});
			this.getView().setModel(oFilteredIncidentModel, "incidentDataModel");
		},

		onIncidentPress: function (oEvent) {
			var oItem = oEvent.getSource();
			var oBindingContext = oItem.getBindingContext("incidentDataModel");
			var sPath = oBindingContext.getPath();
			var sUsername = oBindingContext.getProperty("username");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Incident_Detail", {
				username: sUsername,
				incidentPath: encodeURIComponent(sPath)
			});
		},

		onCreatepress: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var sUsername = sap.ui.core.UIComponent.getRouterFor(this).getHashChanger().getHash().split('/')[1];
			oRouter.navTo("Create_User", {
				username: sUsername
			});
		},
		onRefreshPress: function () {
			var sUsername = sap.ui.core.UIComponent.getRouterFor(this).getHashChanger().getHash().split('/')[1];
			this._loadIncidentData(sUsername);
			MessageToast.show("Incident list refreshed");
		},

		onLogoutPressPress: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Login_Screen");
			MessageToast.show("Logged out successfully");
		}
	});
});