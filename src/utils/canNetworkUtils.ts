import { v4 as uuidv4 } from 'uuid';
import {
  CanNetworkData,
  CanBus,
  EcuNode,
  CanPort,
  CanConnection
} from '../types/can-network';

// Convert input JSON data to visualization model
export const processCanNetworkData = (data: CanNetworkData) => {
  // Count occurrences of each channel
  const channelCounts = new Map<string, number>();
  data.can_channels.forEach(channel => {
    channel.channel_names.forEach(name => {
      channelCounts.set(name, (channelCounts.get(name) || 0) + 1);
    });
  });

  // Extract channel names that have multiple connections
  const busNames = Array.from(channelCounts.entries())
    .filter(([_, count]) => count > 1)
    .map(([name, _]) => name);

  // Create bus objects only for channels with multiple connections
  const buses: CanBus[] = busNames.map((name, index) => ({
    id: `bus-${uuidv4()}`,
    name
  }));

  // Create ECU nodes (initially placed alternating above/below)
  const ecuNodes: EcuNode[] = data.can_channels.map((channel, index) => {
    // Default values
    let isAboveBus = index % 2 === 0;
    let x = 100 + index * 200;
    let y = isAboveBus ? 100 : 400;

    // If position attributes are provided, use those instead
    if (channel.x !== undefined) x = channel.x;
    if (channel.y !== undefined) y = channel.y;
    if (channel.isAboveBus !== undefined) isAboveBus = channel.isAboveBus;

    // Check for layout information that might override position
    if (data.layout?.positions) {
      const layoutPosition = data.layout.positions.find(pos => pos.nodeId === channel.node);
      if (layoutPosition) {
        x = layoutPosition.x;
        y = layoutPosition.y;
        isAboveBus = layoutPosition.isAboveBus;
      }
    }

    return {
      id: `ecu-${uuidv4()}`,
      name: channel.node,
      position: { x, y },
      channels: channel.channel_names,
      isAboveBus
    };
  });

  // Create ports for all channels and connections only for multi-connected channels
  const ports: CanPort[] = [];
  const connections: CanConnection[] = [];

  ecuNodes.forEach(ecu => {
    ecu.channels.forEach(channelName => {
      const bus = buses.find(bus => bus.name === channelName);
      const portId = `port-${uuidv4()}`;
      
      // Create port for all channels
      ports.push({
        id: portId,
        ecuId: ecu.id,
        busId: bus?.id || channelName // Use channel name as ID for single-connection channels
      });
      
      // Create connection only if there's a bus (multiple connections)
      if (bus) {
        connections.push({
          id: `connection-${uuidv4()}`,
          portId,
          busId: bus.id
        });
      }
    });
  });

  return {
    buses,
    ecuNodes,
    ports,
    connections
  };
};

// Calculate layout positions for visualization
export const calculateLayout = (
  buses: CanBus[],
  ecuNodes: EcuNode[],
  canvasWidth: number
) => {
  // Spacing constants
  const busVerticalSpacing = 60;
  const busHorizontalOffset = 100;
  const topEcuY = 100;
  const lastBusY = 250 + (buses.length - 1) * busVerticalSpacing;
  const bottomEcuY = lastBusY + 80;
  
  // Calculate bus positions (horizontal, evenly spaced)
  const busesWithPositions = buses.map((bus, index) => ({
    ...bus,
    position: {
      x: busHorizontalOffset,
      y: 250 + index * busVerticalSpacing
    },
    width: canvasWidth - (busHorizontalOffset * 2)
  }));

  // Ensure ECU positions are consistent with their above/below status
  const updatedEcuNodes = ecuNodes.map(ecu => {
    return {
      ...ecu,
      position: {
        ...ecu.position,
        y: ecu.isAboveBus ? topEcuY : bottomEcuY
      }
    };
  });

  return {
    busesWithPositions,
    updatedEcuNodes
  };
};

// Toggle the position of an ECU (above/below buses)
export const toggleEcuPosition = (
  ecuNodes: EcuNode[],
  ecuId: string
): EcuNode[] => {
  const lastBusY = 250 + 60 * 3;
  const bottomEcuY = lastBusY + 80;
  
  return ecuNodes.map(ecu => {
    if (ecu.id === ecuId) {
      const newIsAboveBus = !ecu.isAboveBus;
      return {
        ...ecu,
        isAboveBus: newIsAboveBus,
        position: {
          ...ecu.position,
          y: newIsAboveBus ? 100 : bottomEcuY
        }
      };
    }
    return ecu;
  });
}; 