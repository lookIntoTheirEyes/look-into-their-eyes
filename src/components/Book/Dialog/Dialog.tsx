import React from "react";

interface DialogProps {
  onClose: () => void;
  pageNumber: number;
}

const Dialog: React.FC<DialogProps> = ({ onClose, pageNumber }) => {
  return (
    <div className='dialog'>
      <div className='dialog-content'>
        <h2>Dialog for Page {pageNumber}</h2>
        <p>This is additional information about page {pageNumber}.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Dialog;
