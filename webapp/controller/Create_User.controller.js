sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/MessageBox"

], function (Controller, JSONModel, MessageToast, Dialog, MessageBox) {
	"use strict";

	return Controller.extend("com.crave.Incident_Management.controller.Create_User", {

		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("Create_User").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			this.sUsername = oEvent.getParameter("arguments").username;
		},

		_generateNewIdAndCreateIncident: function () {
			var oModel = this.getOwnerComponent().getModel("incidentDataModel"); // Assuming you have set the model name as 'incidentModel'

			// Get the incidents data from the model
			var aIncidents = oModel.getProperty("/incident");

			// Find the maximum ID
			var maxId = aIncidents.reduce(function (max, incident) {
				return Math.max(max, parseInt(incident.id, 10));
			}, 0);

			var newId = maxId + 1;

			// Call the onCreateIncidentpress method with the new ID
			this.onCreateIncidentpress(newId);
		},

		onCreateIncidentpress: function (newId) {
			var oView = this.getView();

			var sIncidentType = oView.byId("box0").getSelectedItem().getText();
			var sIncidentTitle = oView.byId("incidentTitle").getValue();
			var sWhatHappened = oView.byId("incidentDescp").getValue();
			var sWhenDidItHappen = oView.byId("whenDate").getDateValue().toISOString();
			var sPriority = oView.byId("box1").getSelectedItem().getText();
			var sLocation = oView.byId("getLocation").getValue();
			var sStatus = oView.byId("box2").getSelectedItem().getText();
			var sObserved = oView.byId("yesObserved").getSelected() ? "Yes" : "No";
			var sInjured = oView.byId("yesInjured").getSelected() ? {
				"Yes": oView.byId("injuredName").getValue(),
				"No": "No"
			} : {
				"Yes": "",
				"No": "No"
			};
			var sDamaged = oView.byId("yesDamaged").getSelected() ? {
				"Yes": oView.byId("damagedName").getValue(),
				"No": "No"
			} : {
				"Yes": "",
				"No": "No"
			};
			var sReleased = oView.byId("yesReleased").getSelected() ? {
				"Yes": {
					"releasedType": oView.byId("releasedType").getSelectedKey(),
					"releasedAmount": oView.byId("releasedAmount").getValue(),
					"uom": oView.byId("uom").getSelectedKey()
				},
				"No": "No"
			} : {
				"Yes": "",
				"No": "No"
			};

			// var oIncidentData = {
			// 	id: newId.toString(),
			// 	type: sIncidentType,
			// 	title: sIncidentTitle,
			// 	description: sWhatHappened,
			// 	date: sWhenDidItHappen,
			// 	priority: sPriority,
			// 	location: sLocation,
			// 	observed: sObserved,
			// 	injured: sInjured,
			// 	damaged: sDamaged,
			// 	released: sReleased
			// };

			var oNewIncident = {
				"id": newId.toString(),
				"username": this.sUsername,
				"incident_type": sIncidentType,
				"incident_title": sIncidentTitle,
				"what_happened": sWhatHappened,
				"status": sStatus,
				"date_time": sWhenDidItHappen,
				"location": sLocation,
				"priority": sPriority,
				"observed": sObserved,
				"injured": sInjured,
				"damaged": sDamaged,
				"released": sReleased,
				"image": this.capturedImageDataURL || "" // Placeholder for the image
			};

			// var oModel = this.getOwnerComponent().getModel("incidentDataModel");
			// var aIncidents = oModel.getProperty("/incident");
			// aIncidents.push(oIncidentData);

			// oModel.setProperty("/incident", aIncidents);

			var oIncidentModel = this.getOwnerComponent().getModel("incidentDataModel");
			var aIncidents = oIncidentModel.getProperty("/incident");

			aIncidents.push(oNewIncident);
			oIncidentModel.setProperty("/incident", aIncidents);

			MessageToast.show("Incident created successfully!");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Incident_List", {
				username: this.sUsername
			});
		},

		onCancelIncidentpress: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Incident_List", {
				username: this.sUsername
			});
		},

		onGetLocationPress: function () {
			var that = this;
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					function (position) {
						var latitude = position.coords.latitude;
						var longitude = position.coords.longitude;
						that.changeToAddress(latitude, longitude);
						console.log(latitude, longitude);
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