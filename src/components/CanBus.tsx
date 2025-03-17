import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface CanBusProps extends NodeProps {
  data: {
    name: string;
    width: number;
  };
}

export const CanBusComponent: React.FC<CanBusProps> = ({ data }) => {
  const { name, width } = data;
  const busColor = getBusColor(name);
  
  return (
    <div 
      className="can-bus" 
      style={{ 
        position: 'relative',
        width: `${width}px`
      }}
    >
      {/* Main bus line */}
      <div 
        className="bus-line"
        style={{ 
          height: '4px',
          background: busColor,
          width: '100%'
        }}
      />
      
      {/* Bus label pill */}
      <div 
        className="bus-label" 
        style={{ 
          position: 'absolute',
          top: '-18px',
          left: '10px',
          background: busColor,
          color: 'white',
          padding: '1px 8px',
          borderRadius: '10px',
          fontSize: '11px',
          fontWeight: 'bold',
          boxShadow: `0 1px 2px rgba(0, 0, 0, 0.2)`
        }}
      >
        {name}
      </div>
      
      {/* Hidden handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ visibility: 'hidden' }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        style={{ visibility: 'hidden' }}
      />
    </div>
  );
};

// Helper function to get a color based on bus name
const getBusColor = (name: string): string => {
  const colors: Record<string, string> = {
    'Red': '#e74c3c',
    'Blue': '#3498db',
    'Green': '#2ecc71',
    'Yellow': '#f1c40f',
    'Orange': '#e67e22',
    'Purple': '#9b59b6'
  };
  
  return colors[name] || '#95a5a6'; // Default gray if not found
};

export default CanBusComponent; 