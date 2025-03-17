import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  NodeTypes,
  EdgeTypes,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { CanNetworkData, EcuNode as EcuNodeType, CanBus } from '../types/can-network';
import { processCanNetworkData, calculateLayout, toggleEcuPosition } from '../utils/canNetworkUtils';
import EcuNodeComponent from './EcuNode';
import CanBusComponent from './CanBus';
import CanConnectorEdge from './CanConnectorEdge';
import JsonFileUploader from './JsonFileUploader';

// Register custom node and edge types
const nodeTypes: NodeTypes = {
  ecuNode: EcuNodeComponent,
  canBus: CanBusComponent,
};

const edgeTypes: EdgeTypes = {
  canConnector: CanConnectorEdge,
};

const CanNetworkVisualizer: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [canvasWidth, setCanvasWidth] = useState(800);
  
  // Store our data models
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ecuNodes, setEcuNodes] = useState<EcuNodeType[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [buses, setBuses] = useState<CanBus[]>([]);
  
  // Store the original data for saving layouts
  const [originalData, setOriginalData] = useState<CanNetworkData | null>(null);
  
  const { fitView } = useReactFlow();
  
  // Load network data from JSON
  const handleNetworkDataLoaded = (data: CanNetworkData) => {
    // Store the original data for later use
    setOriginalData(data);
    
    // Process the input data into our visualization model
    const { buses: processBuses, ecuNodes: processEcus, ports, connections } = processCanNetworkData(data);
    
    setBuses(processBuses);
    setEcuNodes(processEcus);
    
    // Calculate layout
    const { busesWithPositions, updatedEcuNodes } = calculateLayout(processBuses, processEcus, canvasWidth);
    
    // Create nodes for React Flow
    const flowNodes: Node[] = [
      // Create ECU nodes
      ...updatedEcuNodes.map((ecu) => ({
        id: ecu.id,
        type: 'ecuNode',
        position: ecu.position,
        data: {
          name: ecu.name,
          channels: ecu.channels,
          isAboveBus: ecu.isAboveBus,
          onTogglePosition: handleToggleEcuPosition,
        },
        draggable: true,
      })),
      
      // Create bus nodes
      ...busesWithPositions.map((bus) => ({
        id: bus.id,
        type: 'canBus',
        position: {
          x: bus.position.x,
          y: bus.position.y,
        },
        data: {
          name: bus.name,
          width: bus.width,
        },
        draggable: false,
      })),
    ];
    
    // Create edges for connections
    const flowEdges: Edge[] = connections.map(connection => {
      const port = ports.find(p => p.id === connection.portId);
      const bus = processBuses.find(b => b.id === connection.busId);
      const ecu = processEcus.find(e => port && e.id === port.ecuId);
      
      if (!port || !bus || !ecu) return null;
      
      return {
        id: connection.id,
        source: ecu.id,
        target: bus.id,
        sourceHandle: `port-${bus.name}`,
        type: 'canConnector',
        data: {
          busName: bus.name,
        },
      };
    }).filter(Boolean) as Edge[];
    
    // Set the nodes and edges
    setNodes(flowNodes);
    setEdges(flowEdges);
    
    // Fit the view to show all elements
    setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 100);
  };
  
  // Handle toggle ECU position (above/below buses)
  const handleToggleEcuPosition = useCallback((ecuId: string) => {
    setEcuNodes(prevEcuNodes => {
      const updatedEcuNodes = toggleEcuPosition(prevEcuNodes, ecuId);
      
      // Update the nodes in ReactFlow
      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.id === ecuId) {
            const ecu = updatedEcuNodes.find(e => e.id === ecuId);
            if (ecu) {
              return {
                ...node,
                position: ecu.position,
                data: {
                  ...node.data,
                  isAboveBus: ecu.isAboveBus,
                },
              };
            }
          }
          return node;
        })
      );
      
      return updatedEcuNodes;
    });
  }, [setNodes]);
  
  // Handle node drag end to update positions
  const handleNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'ecuNode') {
      // Get bus positions to determine the threshold for above/below
      // Using the first bus's Y position as the threshold
      const buses = nodes.filter(n => n.type === 'canBus');
      
      if (buses.length > 0) {
        const firstBusY = buses[0].position.y;
        // If there are multiple buses, find the middle position between buses
        const middleY = firstBusY - 50; // Threshold is 50px above the first bus
        
        // Check if the node has crossed the threshold
        const wasAbove = node.data.isAboveBus;
        const isNowAbove = node.position.y < middleY;
        
        // If the node crossed the threshold, toggle isAboveBus
        if (wasAbove !== isNowAbove) {
          // Call the toggle function to handle the position change
          handleToggleEcuPosition(node.id);
          return; // Exit early because handleToggleEcuPosition will update positions
        }
      }
      
      // If no threshold was crossed, just update the position
      setEcuNodes(prev => prev.map(ecuNode => {
        if (ecuNode.id === node.id) {
          return {
            ...ecuNode,
            position: node.position
          };
        }
        return ecuNode;
      }));
    }
  }, [nodes, handleToggleEcuPosition]);
  
  // Save current layout
  const saveCurrentLayout = () => {
    if (!originalData) {
      alert('No data loaded to save layout');
      return;
    }
    
    // Create layout positions from current ECU nodes
    const positions = ecuNodes.map(ecuNode => ({
      nodeId: ecuNode.name,
      x: ecuNode.position.x,
      y: ecuNode.position.y,
      isAboveBus: ecuNode.isAboveBus
    }));
    
    // Create a new data object with layout information
    const dataWithLayout: CanNetworkData = {
      ...originalData,
      layout: {
        positions
      }
    };
    
    // Create and download a JSON file
    const dataStr = JSON.stringify(dataWithLayout, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'can_network_with_layout.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // Update canvas width when window resizes
  useEffect(() => {
    const handleResize = () => {
      setCanvasWidth(window.innerWidth - 40);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="can-network-visualizer" style={{ height: '100vh', width: '100%' }}>
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>CAN Network Visualizer</h1>
      
      <JsonFileUploader onFileLoaded={handleNetworkDataLoaded} />
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={saveCurrentLayout}
          style={{
            padding: '8px 16px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          disabled={!originalData}
        >
          Save Current Layout
        </button>
      </div>
      
      <div style={{ height: 'calc(100vh - 240px)', border: '1px solid #ddd' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={handleNodeDragStop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          snapToGrid
          snapGrid={[10, 10]}
          connectionLineType={ConnectionLineType.Straight}
          defaultEdgeOptions={{
            type: 'canConnector',
            style: { strokeWidth: 2 }
          }}
          style={{ background: 'white' }}
        >
          <Background color="#ffffff" gap={0} size={0} />
          <Controls />
        </ReactFlow>
      </div>
      
      <div style={{ margin: '10px 0', fontSize: '14px', color: '#666' }}>
        <p>Drag ECU boxes horizontally to rearrange them. Click on the arrow buttons to toggle ECU position above/below buses.</p>
      </div>
    </div>
  );
};

// Wrap with ReactFlowProvider for access to React Flow context
const CanNetworkVisualizerWrapped: React.FC = () => (
  <ReactFlowProvider>
    <CanNetworkVisualizer />
  </ReactFlowProvider>
);

export default CanNetworkVisualizerWrapped; 