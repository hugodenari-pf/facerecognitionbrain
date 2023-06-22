import React from 'react';
import Tilt from 'react-parallax-tilt';
import brain from "../../resources/images/brain.png"
import './Logo.css';

export const Logo = () => {
  return (
    <div className='ma4 mt0'>
      <Tilt className="br2 shadow-2" style={{ height: 150, width: 150 }} >
        <div className="inner pa3">
          <img style={{paddingTop: '5px'}} alt='logo' src={brain}/>
        </div>
      </Tilt>
    </div>
  );
}