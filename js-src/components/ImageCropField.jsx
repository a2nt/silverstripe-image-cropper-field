import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import classnames from "classnames";
import Dimensions from "./Dimensions.jsx";
import AspectRatio from "./AspectRatio.jsx";
import AspectRatioButton from "./AspectRatioButton.jsx";
import ToolbarButton from "./ToolbarButton.jsx";
import Cropper from "../assets/cropper.min.js";
import ReactTooltip from "react-tooltip";
import {
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
} from "reactstrap";

class ImageCropField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showAlertMessage: false,
      cropper: null,
      activeButton: {
        moveTool: null,
        selectionTool: "active",
      },
      cropper: null,
      showModal: false,
      preview: null,
      alertMessageLink: null,
      //selected area with and height
      selectedWidth: null,
      selectedHeight: null,
      //the crop button settings
      cropButtonClass: "font-icon-rocket",
      cropButtonColor: "primary",
      //this is the custom aspect ratio
      customAspectRatio: "",
      //use to determin which aspect ratio button to highlight
      selectedAspect: "free",
    };

    //bindings
    this.handleSave = this.handleSave.bind(this);
    this.moveTool = this.moveTool.bind(this);
    this.selectionTool = this.selectionTool.bind(this);
    this.resetTool = this.resetTool.bind(this);
    this.zoominTool = this.zoominTool.bind(this);
    this.zoomoutTool = this.zoomoutTool.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.handleAspectChange = this.handleAspectChange.bind(this);
    this.setCustomAspectRatio = this.setCustomAspectRatio.bind(this);
  }

  /*
   * when the component has been fully loaded
   */
  componentDidMount(e) {
    let image = ReactDOM.findDOMNode(this.refs.image);
    let self = this;
    //store the cropper in a state
    let cropper = this.state.cropper;
    cropper = new Cropper(image, {
      responsive: true,
      minContainerWidth: 542,
      minContainerHeight: 500,
      crop(event) {
        self.setState({
          selectedWidth: event.detail.width.toFixed(),
          selectedHeight: event.detail.height.toFixed(),
        });
      },
    });

    this.setState({ cropper });
  }

  toggleModal() {
    //find the cropper
    let cropper = this.state.cropper;

    this.setState({
      showModal: !this.state.showModal,
      preview: cropper.getCroppedCanvas().toDataURL(),
      showAlertMessage: null,
      //set the button to none-saved state
      cropButtonClass: "font-icon-rocket",
      cropButtonColor: "primary",
    });
  }

  /**
   * handle saving the cropped image
   */
  handleSave() {
    let form = document.getElementById("Form_fileEditForm");
    //#Form_fileEditForm_Name
    let fieldName = document.getElementById("Form_fileEditForm_Name");
    //if the above form is empty, assume we are in the file insert form and atempt to get that
    if (form === null) {
      form = document.getElementById("Form_fileInsertForm");
      //#Form_fileInsertForm_Name
      fieldName = document.getElementById("Form_fileInsertForm_Name");
    }
    let formUrl = form.getAttribute("action");
    let self = this;
    let url =
      encodeURI(formUrl) +
      "/field/" +
      ReactDOM.findDOMNode(this.refs.image)
        .closest(".imagecrop-field")
        .getAttribute("name") +
      "/cropImage";

    //find the cropper
    let cropper = this.state.cropper;

    //remove the period
    fieldName = fieldName.value.substring(0, fieldName.value.indexOf("."));

    //the cropped image
    let data = {
      image: cropper.getCroppedCanvas().toDataURL(),
      width: cropper.getData()["width"].toFixed(),
      height: cropper.getData()["height"].toFixed(),
      name: fieldName,
    };

    this.setState({
      cropButtonClass: "font-icon-dot-3",
      cropButtonColor: "outline-primary",
    });

    //send the data to be processed
    this.postAjax(url, data, function(data) {
      let d = JSON.parse(data);

      //close the modal and show the message
      self.setState({
        showAlertMessage: true,
        alertMessageLink: d.link,
        cropButtonClass: "font-icon-tick",
      });
    });
  }

  /**
   * Trigger the move tool
   */
  moveTool(e) {
    //find the cropper
    let cropper = this.state.cropper;
    //trigger the move tool
    cropper.setDragMode("move");
    //reset active buttons
    this.clearActiveButtons();
    this.setActiveButton("moveTool");
  }

  /**
   * Trigger the selection tool
   */
  selectionTool(e) {
    //find the cropper
    let cropper = this.state.cropper;
    //trigger the crop/selection tool
    cropper.setDragMode("crop");
    //reset active buttons
    this.clearActiveButtons();
    this.setActiveButton("selectionTool");
  }

  /**
   * Reset the cropper field
   */
  resetTool(e) {
    //find the cropper
    let cropper = this.state.cropper;
    //reset
    cropper.reset();
    //set the aspect ratio to none
    this.setAspectRatio(NaN, true, "free");
  }

  /**
   * zoom in
   */
  zoominTool(e) {
    //find the cropper
    let cropper = this.state.cropper;
    //zoom in
    cropper.zoom("0.1");
  }

  /**
   * zoom in
   */
  zoomoutTool(e) {
    //find the cropper
    let cropper = this.state.cropper;
    //zoom in
    cropper.zoom("-0.1");
  }

  /**
   * clear all active buttons
   */
  clearActiveButtons() {
    let buttons = this.state.activeButton;
    //set all to false
    for (let [key, value] of Object.entries(buttons)) {
      buttons[key] = null;
    }
    this.setState({ buttons });
  }

  /**
   * set the currently active button
   */
  setActiveButton(act) {
    //set the button active
    let button = this.state.activeButton;
    button[act] = "active";
    this.setState({ button });
  }

  setAspectRatio(number, clearCustom = false, name = null) {
    //find the cropper
    let cropper = this.state.cropper;

    //clear the customAspectRatio state if clear custom is set to true
    if (clearCustom) {
      this.setState({
        customAspectRatio: "",
      });
    }

    //set this as the currently active button
    if (name) {
      this.setState({
        selectedAspect: name,
      });
    }

    //set aspect ratio
    cropper.setAspectRatio(number);
  }

  /**
   * handle changes to the custom aspect ratio field
   */
  handleAspectChange(e) {
    this.setState({ customAspectRatio: e.target.value });
  }

  /**
   * allows the user to set a custom aspect.
   * uses the customAspectRatio state
   */
  setCustomAspectRatio() {
    let requestedAR = this.state.customAspectRatio;
    let newData = requestedAR.split(":");
    //set the aspect ratio
    this.setAspectRatio(newData[0] / newData[1], false, "custom");
  }

  /**
   * allows us to make simple post request
   */
  postAjax(url, data, success) {
    var params =
      typeof data == "string"
        ? data
        : Object.keys(data)
            .map(function(k) {
              return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
            })
            .join("&");

    var xhr = window.XMLHttpRequest
      ? new XMLHttpRequest()
      : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open("POST", url);
    xhr.onreadystatechange = function() {
      if (xhr.readyState > 3 && xhr.status == 200) {
        success(xhr.responseText);
      }
    };
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(params);
    return xhr;
  }

  /**
   * Handles rendering the field
   */
  render() {
    let AlertMessage = null;
    if (this.state.showAlertMessage) {
      //show the alert message
      AlertMessage = (
        <Alert color="success">
          Your image has been saved. Click{" "}
          <a href={this.state.alertMessageLink}>here</a> to edit it.
        </Alert>
      );
    }

    return (
      <div class="imagecrop-field" name={this.props.data.name}>
        <ReactTooltip />
        <Modal
          isOpen={this.state.showModal}
          toggle={() => this.toggleModal()}
          className="crop-preview"
        >
          <ModalHeader toggle={() => this.toggleModal()}>
            Crop Preview
          </ModalHeader>
          <ModalBody>
            {AlertMessage}
            <div class="image-crop-preview">
              <img src={this.state.preview} />
            </div>
            <div class="image-crop-notes">
              <span class="small">
                <Dimensions
                  selectedWidth={this.state.selectedWidth}
                  selectedHeight={this.state.selectedHeight}
                />
              </span>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color={this.state.cropButtonColor}
              onClick={() => this.handleSave()}
              className={this.state.cropButtonClass}
            >
              Crop Image
            </Button>
          </ModalFooter>
        </Modal>
        <Dimensions
          selectedWidth={this.state.selectedWidth}
          selectedHeight={this.state.selectedHeight}
        />
        <div class="imagecrop-field-toolbar">
          <ToolbarButton
            onClick={e => this.moveTool(e)}
            extraClasses={this.state.activeButton.moveTool}
            name="move-tool"
            datatip="Toggle the move tool"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <path d="M12 10c1.104 0 2 .896 2 2s-.896 2-2 2-2-.896-2-2 .896-2 2-2zm-3.857 3c-.084-.321-.143-.652-.143-1s.059-.679.143-1h-2.143v-4l-6 5 6 5v-4h2.143zm7.714-2c.084.321.143.652.143 1s-.059.679-.143 1h2.143v4l6-5-6-5v4h-2.143zm-2.857 4.857c-.321.084-.652.143-1 .143s-.679-.059-1-.143v2.143h-4l5 6 5-6h-4v-2.143zm-2-7.714c.321-.084.652-.143 1-.143s.679.059 1 .143v-2.143h4l-5-6-5 6h4v2.143z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={e => this.selectionTool(e)}
            extraClasses={this.state.activeButton.selectionTool}
            name="selection-tool"
            datatip="Toggle the selection tool"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <path d="M20 18v-14h-14v-4h-2v4h-4v2h4v14h14v4h2v-4h4v-2h-4zm-2-9h-3v-3h3v3zm-8 5v-4h4v4h-4zm4 1v3h-4v-3h4zm-5-1h-3v-4h3v4zm1-5v-3h4v3h-4zm5 1h3v4h-3v-4zm-6-4v3h-3v-3h3zm-3 9h3v3h-3v-3zm9 3v-3h3v3h-3z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={e => this.zoominTool(e)}
            name="zoomin-tool"
            datatip="Zoom in"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <path d="M13 10h-3v3h-2v-3h-3v-2h3v-3h2v3h3v2zm8.172 14l-7.387-7.387c-1.388.874-3.024 1.387-4.785 1.387-4.971 0-9-4.029-9-9s4.029-9 9-9 9 4.029 9 9c0 1.761-.514 3.398-1.387 4.785l7.387 7.387-2.828 2.828zm-12.172-8c3.859 0 7-3.14 7-7s-3.141-7-7-7-7 3.14-7 7 3.141 7 7 7z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={e => this.zoomoutTool(e)}
            name="zoomout-tool"
            datatip="Zoom out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <path d="M13 10h-8v-2h8v2zm8.172 14l-7.387-7.387c-1.388.874-3.024 1.387-4.785 1.387-4.971 0-9-4.029-9-9s4.029-9 9-9 9 4.029 9 9c0 1.761-.514 3.398-1.387 4.785l7.387 7.387-2.828 2.828zm-12.172-8c3.859 0 7-3.14 7-7s-3.141-7-7-7-7 3.14-7 7 3.141 7 7 7z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={e => this.resetTool(e)}
            name="reset-tool"
            datatip="Rest the crop area"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <path d="M16.728 20.644l1.24 1.588c-1.721 1.114-3.766 1.768-5.969 1.768-4.077 0-7.626-2.225-9.524-5.52l-1.693.982 1.09-4.1 4.101 1.089-1.747 1.014c1.553 2.699 4.442 4.535 7.773 4.535 1.736 0 3.353-.502 4.729-1.356zm-13.722-7.52l-.007-.124c0-4.625 3.51-8.433 8.003-8.932l-.002 1.932 3.004-2.996-2.994-3.004-.004 2.05c-5.61.503-10.007 5.21-10.007 10.95l.021.402 1.986-.278zm18.577 5.243c.896-1.588 1.416-3.414 1.416-5.367 0-4.577-2.797-8.499-6.773-10.156l-.623 1.914c3.173 1.393 5.396 4.561 5.396 8.242 0 1.603-.441 3.097-1.18 4.402l-1.762-.964 1.193 4.072 4.071-1.192-1.738-.951z" />
            </svg>
          </ToolbarButton>
          <AspectRatio>
            <AspectRatioButton
              onClick={e => this.setAspectRatio(16 / 9, true, "16by9")}
              dataTip="Set the aspect ratio to 16 by 9"
              extraClasses={this.state.selectedAspect}
              name="16by9"
            >
              16:9
            </AspectRatioButton>
            <AspectRatioButton
              onClick={e => this.setAspectRatio(4 / 3, true, "4by3")}
              dataTip="Set the aspect ratio to 4 by 3"
              extraClasses={this.state.selectedAspect}
              name="4by3"
            >
              4:3
            </AspectRatioButton>
            <AspectRatioButton
              onClick={e => this.setAspectRatio(1 / 1, true, "1by1")}
              dataTip="Set the aspect ratio to 1 by 1"
              extraClasses={this.state.selectedAspect}
              name="1by1"
            >
              1:1
            </AspectRatioButton>
            <AspectRatioButton
              onClick={e => this.setAspectRatio(2 / 3, true, "2by3")}
              dataTip="Set the aspect ratio to 2 by 3"
              extraClasses={this.state.selectedAspect}
              name="2by3"
            >
              2:3
            </AspectRatioButton>
            <AspectRatioButton
              onClick={e => this.setAspectRatio(NaN, true, "free")}
              dataTip="Set the aspect ratio to free mode"
              extraClasses={this.state.selectedAspect}
              name="free"
            >
              Free
            </AspectRatioButton>
            <AspectRatioButton
              extraClasses={this.state.selectedAspect}
              name="custom"
            >
              <Input
                type="text"
                value={this.state.customAspectRatio}
                onChange={this.handleAspectChange}
                placeholder="Example: 16:9"
              />
              <Button
                color="primary"
                onClick={() => this.setCustomAspectRatio()}
              >
                Set Custom Aspect Ratio
              </Button>
            </AspectRatioButton>
          </AspectRatio>
          <ToolbarButton
            onClick={() => this.toggleModal()}
            name="savecropped-tool"
            data-tip="Save the cropped image to the Cropped folder"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <path d="M15.003 3h2.997v5h-2.997v-5zm8.997 1v20h-24v-24h20l4 4zm-19 5h14v-7h-14v7zm16 4h-18v9h18v-9z" />
            </svg>
          </ToolbarButton>
        </div>
        <div class="img-container">
          <img
            class="imagecrop-field-selection"
            src={this.props.data.image}
            ref="image"
          ></img>
        </div>
      </div>
    );
  }
}

export default ImageCropField;
