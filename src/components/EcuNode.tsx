import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface EcuNodeProps extends NodeProps {
  data: {
    name: string;
    channels: string[];
    isAboveBus: boolean;
    onTogglePosition: (id: string) => void;
  };
}

export const EcuNodeComponent: React.FC<EcuNodeProps> = ({ id, data }) => {
  const { name, channels, isAboveBus, onTogglePosition } = data;
  
  // Determine handle position based on whether the ECU is above or below the bus
  const handlePosition = isAboveBus ? Position.Bottom : Position.Top;
  
  return (
    <div 
      className="ecu-node" 
      style={{
        padding: '12px',
        borderRadius: '5px',
        background: '#f5f5f5',
        border: '1px solid #ddd',
        width: '200px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        position: 'relative'
      }}
    >
      {/* ECU title centered */}
      <div 
        className="ecu-header"
        style={{
          width: '100%',
          textAlign: 'center',
          marginBottom: '10px',
          position: 'relative',
          height: '24px'
        }}
      >
        <div className="ecu-title" style={{ 
          fontWeight: 'bold', 
          position: 'absolute',
          width: '100%',
          left: 0,
          top: isAboveBus ? '5px' : '50px',
          textAlign: 'center'
        }}>
          {name}
        </div>
        <button 
          onClick={() => onTogglePosition(id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            position: 'absolute',
            right: '0',
            top: '0'
          }}
        >
        </button>
      </div>
      
      {/* Position ports along the bottom or top edge */}
      <div className="ecu-ports" style={{ 
        display: 'flex',
        justifyContent: 'space-around',
        position: 'relative',
        height: isAboveBus ? '30px' : (channels.length > 0 ? '40px' : '30px'),
        marginTop: isAboveBus ? '15px' : '0',
        marginBottom: isAboveBus ? '0' : '5px'
      }}>
        {channels.map((channel, index) => {
          // Calculate the x-position for each port, evenly distributed
          const portSpacing = 200 / (channels.length + 1);
          const xPosition = portSpacing * (index + 1);
          
          return (
            <div 
              key={index} 
              style={{ 
                position: 'absolute',
                left: `${xPosition}px`,
                bottom: isAboveBus ? '0' : 'auto',
                top: isAboveBus ? 'auto' : '-35px', // Adjusted to align exactly with top edge
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              {isAboveBus ? (
                <>
                  {/* Label for ECUs above buses */}
                  <div 
                    style={{ 
                      transform: 'rotate(-45deg)',
                      transformOrigin: 'bottom left',
                      fontSize: '12px',
                      marginBottom: '5px',
                      whiteSpace: 'nowrap',
                      color: getBusColor(channel),
                      position: 'absolute',
                      left: '0',
                      bottom: '10px'
                    }}
                  >
                    {channel}
                  </div>
                  
                  {/* Handle positioned at bottom edge */}
                  <Handle
                    type="source"
                    position={Position.Bottom}
                    id={`port-${channel}`}
                    style={{
                      width: '10px',
                      height: '10px',
                      background: getBusColor(channel),
                      border: '2px solid white',
                      bottom: '-7px',
                      left: '0',
                      zIndex: 10
                    }}
                  />
                </>
              ) : (
                <>
                  {/* Handle positioned at top edge for ECUs below */}
                  <Handle
                    type="source"
                    position={Position.Top}
                    id={`port-${channel}`}
                    style={{
                      width: '10px',
                      height: '10px',
                      background: getBusColor(channel),
                      border: '2px solid white',
                      top: '-6px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 10
                    }}
                  />
                  
                  {/* Label for ECUs below buses */}
                  <div 
                    style={{ 
                      transform: 'rotate(-45deg)',
                      transformOrigin: 'top left',
                      fontSize: '12px',
                      marginTop: '15px',
                      whiteSpace: 'nowrap',
                      color: getBusColor(channel),
                      position: 'absolute',
                      left: '-25px',
                      top: '15px'
                    }}
                  >
                    {channel}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const getBusColor = (name: string): string => {
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

export default EcuNodeComponent; 