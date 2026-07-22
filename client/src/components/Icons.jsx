import React from 'react';

export const Icon = ({ name, color, sx = {}, style = {}, fontSize }) => {
  const iconSize = fontSize === 'small' ? 18 : fontSize === 'large' ? 32 : fontSize === 'inherit' ? 'inherit' : 22;
  return (
    <span
      className="material-icons"
      style={{
        fontSize: typeof fontSize === 'number' ? fontSize : iconSize,
        verticalAlign: 'middle',
        color: color || 'inherit',
        userSelect: 'none',
        ...style,
        ...sx
      }}
    >
      {name}
    </span>
  );
};

export default Icon;
