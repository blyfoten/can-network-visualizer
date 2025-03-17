import React from 'react';
import { EdgeProps } from 'reactflow';

interface CanConnectorEdgeProps extends EdgeProps {
  data?: {
    busName?: string;
  };
}

export const CanConnectorEdge: React.FC<CanConnectorEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data
}) => {
  // Create a direct vertical line from source (ECU port) to target (bus)
  // Adjust the target Y to ensure it precisely connects with the bus line
  const adjustedTargetY = targetY + 4; // Adjust by 1px to ensure precise connection
  
  // By keeping the X coordinates the same, we ensure a straight vertical line
  const path = `M${sourceX},${sourceY} L${sourceX},${adjustedTargetY}`;
  
  // Get color based on bus name if available
  const edgeColor = getBusColor(data?.busName);
  
  return (
    <path
      id={id}
      style={{
        ...style,
        stroke: edgeColor,
        strokeWidth: 2,
        fill: 'none'
      }}
      className="react-flow__edge-path"
      d={path}
    />
  );
};

// Helper function to get a color based on bus name
const getBusColor = (name?: string): string => {
  if (!name) return '#95a5a6'; // Default gray

  const colors: Record<string, string> = {
    'Red': '#e74c3c',
    'Blue': '#3498db',
    'Green': '#2ecc71',
    'Yellow': '#f1c40f',
    'Orange': '#e67e22',
    'Purple': '#9b59b6'
  };
  
  return colors[name] || '#95a5a6';
};

export default CanConnectorEdge; 