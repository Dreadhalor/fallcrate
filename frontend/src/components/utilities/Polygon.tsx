import React, { CSSProperties } from 'react';

type Props = {
  points: [number, number][];
  fill: string;
  children?: React.ReactNode;
};

const Polygon: React.FC<Props> = ({ points, fill, children }) => {
  const pointsString = points.map((point) => point.join(',')).join(' ');

  const svgStyles: CSSProperties = {
    display: 'inline-block',
    position: 'absolute',
    overflow: 'visible',
    pointerEvents: 'none', // Ignore mouse events on the SVG to allow interaction with children
  };

  const calculateWidthAndHeight = () => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    points.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });

    return {
      width: maxX - minX,
      height: maxY - minY,
    };
  };

  const { width, height } = calculateWidthAndHeight();

  const childrenContainerStyles: CSSProperties = {
    position: 'relative',
    width,
    height,
  };

  return (
    <div style={childrenContainerStyles}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={svgStyles}
      >
        <polygon points={pointsString} fill={fill} />
      </svg>
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
};

export default Polygon;
