sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, Dialog, MessageBox) {
	"use strict";

	return Controller.extend("com.crave.Incident_Management.controller.Update_Detail", {

		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("Update_Detail").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			this.sUsername = oEvent.getParameter("arguments").username;
			var sUsername = oEvent.getParameter("arguments").username;
			var sIncidentPath = decodeURIComponent(oEvent.getParameter("arguments").incidentPath);

			// Clear form fields before loading new data
			this._clearFormFields();

			this._loadIncidentData(sIncidentPath, sUsername);
		},

		_clearFormFields: function () {
			var oView = this.getView();
			oView.byId("box0").setSelectedKey("");
			oView.byId("incidentTitle").setValue("");
			oView.byId("incidentDescp").setValue("");
			oView.byId("whenDate").setValue("");
			oView.byId("box1").setSelectedKey("");
			oView.byId("box2").setSelectedKey("");
			oView.byId("getLocation").setValue("");
			oView.byId("yesObserved").setSelected(false);
			oView.byId("noObserved").setSelected(false);
			oView.byId("yesInjured").setSelected(false);
			oView.byId("noInjured").setSelected(false);
			oView.byId("injuredName").setValue("").setVisible(false);
			oView.byId("yesDamaged").setSelected(false);
			oView.byId("noDamaged").setSelected(false);
			oView.byId("damagedName").setValue("").setVisible(false);
			oView.byId("yesReleased").setSelected(false);
			oView.byId("noReleased").setSelected(false);
			oView.byId("releasedFields").setVisible(false);
			oView.byId("releasedType").setSelectedKey("");
			oView.byId("releasedAmount").setValue("");
			oView.byId("uom").setSelectedKey("");
			oView.byId("image0").setSrc("");
			this.capturedImageDataURL = null;
		},

			_loadIncidentData: function (sIncidentPath, sUsername) {
			var oIncidentModel = this.getView().getModel("incidentDataModel");
			var oIncidentData = oIncidentModel.getProperty(sIncidentPath);

			// Populate the form fields with the incident data
			this.getView().byId("box0").setSelectedKey(oIncidentData.incident_type);
			this.getView().byId("incidentTitle").setValue(oIncidentData.incident_title);
			this.getView().byId("incidentDescp").setValue(oIncidentData.what_happened);
			this.getView().byId("whenDate").setValue(new Date(oIncidentData.date_time).toISOString().split('T')[0]);
			this.getView().byId("box1").setSelectedKey(oIncidentData.priority);
			this.getView().byId("box2").setSelectedKey(oIncidentData.status);
			this.getView().byId("getLocation").setValue(oIncidentData.location);

			// Set radio button selections
			this.getView().byId("yesObserved").setSelected(oIncidentData.observed === "Yes");
			this.getView().byId("noObserved").setSelected(oIncidentData.observed === "No");

			this.getView().byId("yesInjured").setSelected(oIncidentData.injured.Yes !== undefined);
			this.getView().byId("noInjured").setSelected(oIncidentData.injured.No !== undefined);

			this.getView().byId("yesDamaged").setSelected(oIncidentData.damaged.Yes !== undefined);
			this.getView().byId("noDamaged").setSelected(oIncidentData.damaged.No !== undefined);

			this.getView().byId("yesReleased").setSelected(oIncidentData.released.Yes !== undefined);
			this.getView().byId("noReleased").setSelected(oIncidentData.released.No !== undefined);

			// Set the image
			this.getView().byId("image0").setSrc(oIncidentData.image);

			// Store the incident path for later use
			this._sIncidentPath = sIncidentPath;
			this._sUsername = sUsername;
		},

		onUpdateIncidentPress: function () {
			var oView = this.getView();
			var oModel = this.getOwnerComponent().getModel("incidentDataModel");
			var oCurrentIncident = oModel.getProperty(this._sIncidentPath);

			var oUpdatedIncident = {
				incident_type: oView.byId("box0").getSelectedItem().getText(),
				incident_title: oView.byId("incidentTitle").getValue(),
				what_happened: oView.byId("incidentDescp").getValue(),
				date_time: new Date(oView.byId("whenDate").getValue()).toISOString(),
				priority: oView.byId("box1").getSelectedItem().getText(),
				status: oView.byId("box2").getSelectedItem().getText(),
				location: oView.byId("getLocation").getValue(),
				observed: oView.byId("yesObserved").getSelected() ? "Yes" : "No",
				injured: {
					Yes: oView.byId("yesInjured").getSelected() ? oView.byId("injuredName").getValue() : undefined,
					No: oView.byId("noInjured").getSelected() ? "No" : undefined
				},
				damaged: {
					Yes: oView.byId("yesDamaged").getSelected() ? oView.byId("damagedName").getValue() : undefined,
					No: oView.byId("noDamaged").getSelected() ? "No" : undefined
				},
				released: {
					Yes: oView.byId("yesReleased").getSelected() ? {
						type: oView.byId("releasedType").getSelectedKey(),
						amount: oView.byId("releasedAmount").getValue(),
						uom: oView.byId("uom").getSelectedKey()
					} : undefined,
					No: oView.byId("noReleased").getSelected() ? "No" : undefined
				},
				image: this.capturedImageDataURL || oCurrentIncident.image
			};

			// Preserve existing properties
			for (var prop in oCurrentIncident) {
				if (!(prop in oUpdatedIncident)) {
					oUpdatedIncident[prop] = oCurrentIncident[prop];
				}
			}

			oModel.setProperty(this._sIncidentPath, oUpdatedIncident);

			sap.m.MessageToast.show("Incident updated successfully");

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Incident_List", {
				username: this._sUsername
			});
		},

		onCancelIncidentpress: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Incident_List", {
				username: this.sUsername
			});
		},

		onCameraPress: function () {
			// Implement camera functionality here if needed
		},

		onGetLocationPress: function () {
			var that = this;
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					function (position) {
						var latitude = position.coords.latitude;
						var longitude = position.coords.longitude;
						that.changeToAddress(latitude, longitude);
						// var locationString = "Latitude: " + latitude + ", Longitude: " + longitude;
						// that.getView().byId("getLocation").setValue(locationString);
					},
					function (error) {
						MessageToast.show("Error getting location: " + error.message);
					}
				);
			} else {
				MessageToast.show("Geolocation is not supported by this browser.");
			}
		},

		changeToAddress: function (latitude, longitude) {
			var oView = this.getView();
			var apiUrl = "https://nominatim.openstreetmap.org/reverse";
			var urlParams = {
				format: "json",
				lat: latitude,
				lon: longitude
			};

			// Call the geocoding API
			jQuery.ajax({
				url: apiUrl,
				data: urlParams,
				success: function (response) {
					var address = response.display_name;
					console.log("Address:", address);
					// pageThis.byId("locID").setValue(address);
					oView.byId("getLocation").setValue(address);
					sap.ui.getCore().busyDialog.close();
				},
				error: function (xhr, status, error) {
					sap.ui.getCore().busyDialog.close();
					console.log("Error occurred while retrieving reverse geocoding data:", error);
				}
			});
		},
		onInjuredChange: function (oEvent) {
			var sSelected = oEvent.getSource().getText();
			this.getView().byId("injuredName").setVisible(sSelected === "Yes");
		},

		onDamagedChange: function (oEvent) {
			var sSelected = oEvent.getSource().getText();
			this.getView().byId("damagedName").setVisible(sSelected === "Yes");
		},

		onReleasedChange: function (oEvent) {
			var sSelected = oEvent.getSource().getText();
			this.getView().byId("releasedFields").setVisible(sSelected === "Yes");
		},
		takePhoto: function () {
			var that = this;
			this.fixedDialog = new Dialog({
				title: "Click on Capture to take photo",
				content: [
					new sap.ui.core.HTML({
						content: "<video id='player' autoplay style='width: 100%; max-height: 70vh; object-fit: cover;'></video>"
					}),
					// new sap.m.Input({
					// 	placeholder: "Please enter the image name here",
					// 	required: true,
					// 	liveChange: function (oEvent) {
					// 		that.attachName = oEvent.getParameter("value");
					// 	}
					// })
				],
				buttons: [
					new sap.m.Button({
						text: "Switch Camera",
						press: function () {
							that.toggleCamera();
						}
					}),
					new sap.m.Button({
						text: "Capture",
						type: "Emphasized",
						press: function () {
							that.captureImage();
							that.fixedDialog.close();
						}
					}),
					new sap.m.Button({
						text: "Cancel",
						press: function () {
							that.stopCameraStream();
							that.fixedDialog.close();
						}
					})
				],
				afterClose: function () {
					that.stopCameraStream();
				}
			});
			this.getView().addDependent(this.fixedDialog);
			this.fixedDialog.open();
			this.startCameraStream();
		},
		toggleCamera: function () {
			if (this.stream) {
				this.stopCameraStream();
				var currentFacingMode = this.currentFacingMode === "environment" ? "user" : "environment";
				this.currentFacingMode = currentFacingMode;

				var constraints = {
					video: {
						facingMode: {
							exact: currentFacingMode
						}
					}
				};

				var that = this;
				navigator.mediaDevices.getUserMedia(constraints)
					.then(function (stream) {
						that.stream = stream;
						var videoElement = document.getElementById("player");
						videoElement.srcObject = stream;
					}).catch(function (err) {
						console.error("Error switching camera", err);
						MessageToast.show("Unable to switch camera. Using default camera.");
						that.startCameraStream(); // Fall back to default camera
					});
			}
		},

		startCameraStream: function () {
			var that = this;
			var constraints = {
				video: {
					facingMode: {
						ideal: "environment"
					}
				}
			};

			navigator.mediaDevices.getUserMedia(constraints)
				.then(function (stream) {
					that.stream = stream;
					var videoElement = document.getElementById("player");
					videoElement.srcObject = stream;
				}).catch(function (err) {
					console.error("Error accessing media devices.", err);
					// If the back camera is not available, fall back to any available camera
					navigator.mediaDevices.getUserMedia({
							video: true
						})
						.then(function (stream) {
							that.stream = stream;
							var videoElement = document.getElementById("player");
							videoElement.srcObject = stream;
						}).catch(function (fallbackErr) {
							console.error("Error accessing any camera.", fallbackErr);
							MessageToast.show("Unable to access camera. Please check your device settings.");
						});
				});
		},

		stopCameraStream: function () {
			if (this.stream) {
				this.stream.getTracks().forEach(function (track) {
					track.stop();
				});
			}
		},

		captureImage: function () {
			this.imageVal = document.getElementById("player");
			this.setImage();
			this.stopCameraStream();
		},

		setImage: function () {
			var imageControl = this.getView().byId("image0");
			var imageVal = this.imageVal;

			// Create a temporary canvas to draw the image
			var tempCanvas = document.createElement('canvas');
			tempCanvas.width = 320;
			tempCanvas.height = 320;
			var context = tempCanvas.getContext('2d');
			context.drawImage(imageVal, 0, 0, tempCanvas.width, tempCanvas.height);

			// Convert the canvas to a data URL
			var dataURL = tempCanvas.toDataURL('image/jpeg');

			// Set the data URL as the source of the Image control
			imageControl.setSrc(dataURL);

			// Store the data URL in a controller property
			this.capturedImageDataURL = dataURL;

			// Optionally, you can set the attachment name if needed
			if (this.attachName) {
				imageControl.setAlt(this.attachName);
				imageControl.setTooltip(this.attachName);
			}
		}

	});

});