import React from 'react';

function Modal(props:any) {
  if(!props.show) return null;
  
  return (
    <div className={`modal ${props.show ? 'show' : ''}`}>
      <div className="modal-content">
        {props.children}
      </div>
    </div>
  )
}

export default Modal;