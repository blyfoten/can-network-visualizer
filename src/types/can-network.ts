// Types for the CAN network model

// Input JSON structure
export interface CanChannelData {
  node: string;
  channels: string[];
  // Optional position attributes
  x?: number;
  y?: number;
  isAboveBus?: boolean;
}

/**
 * Main data structure for the CAN network
 * 
 * Example with layout information:
 * {
 *   "can_channels": [
 *     { "node": "ECU1", "channels": ["Red", "Blue", "Yellow"] },
 *     { "node": "ECU2", "channels": ["Blue", "Green"] },
 *     { "node": "ECU3", "channels": ["Red", "Blue"] }
 *   ],
 *   "layout": {
 *     "positions": [
 *       { "nodeId": "ECU1", "x": 100, "y": 100, "isAboveBus": true },
 *       { "nodeId": "ECU2", "x": 400, "y": 500, "isAboveBus": false },
 *       { "nodeId": "ECU3", "x": 700, "y": 100, "isAboveBus": true }
 *     ]
 *   }
 * }
 */
export interface CanNetworkData {
  can_channels: CanChannelData[];
  // Optional layout information
  layout?: {
    positions: {
      nodeId: string;
      x: number;
      y: number;
      isAboveBus: boolean;
    }[];
  };
}

// For visualization
export interface EcuNode {
  id: string;
  name: string;
  position: { x: number, y: number };
  channels: string[];
  isAboveBus: boolean;
}

export interface CanBus {
  id: string;
  name: string;
}

export interface CanPort {
  id: string;
  ecuId: string;
  busId: string;
}

export interface CanConnection {
  id: string;
  portId: string;
  busId: string;
} 