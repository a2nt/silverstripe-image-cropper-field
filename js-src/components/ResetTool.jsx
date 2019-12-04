/* global jQuery */
import React, { Component } from "react";

class ResetTool extends Component {
  render() {
    return (
      <span class="imagecrop-field-reset-tool tool-on">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <path d="M16.728 20.644l1.24 1.588c-1.721 1.114-3.766 1.768-5.969 1.768-4.077 0-7.626-2.225-9.524-5.52l-1.693.982 1.09-4.1 4.101 1.089-1.747 1.014c1.553 2.699 4.442 4.535 7.773 4.535 1.736 0 3.353-.502 4.729-1.356zm-13.722-7.52l-.007-.124c0-4.625 3.51-8.433 8.003-8.932l-.002 1.932 3.004-2.996-2.994-3.004-.004 2.05c-5.61.503-10.007 5.21-10.007 10.95l.021.402 1.986-.278zm18.577 5.243c.896-1.588 1.416-3.414 1.416-5.367 0-4.577-2.797-8.499-6.773-10.156l-.623 1.914c3.173 1.393 5.396 4.561 5.396 8.242 0 1.603-.441 3.097-1.18 4.402l-1.762-.964 1.193 4.072 4.071-1.192-1.738-.951z" />
        </svg>
      </span>
    );
  }
}

export default ResetTool;

// jquery to handle the image field
jQuery.entwine("ImageCropResetTool", function($) {
  //handle reset
  $(".imagecrop-field-reset-tool").entwine({
    onclick: function(e) {
      //get the proper edit form so we can have multiple image selection fields
      let target = this.parent()
        .parent()
        .find(".imagecrop-field-selection");

      //toggle crop mode
      target.cropper("reset");

      $(this)._super();
    },
  });
});
