# CAN Network Visualizer

A web-based tool for visualizing CAN (Controller Area Network) bus connections in vehicle control systems.

## Features

- Load CAN network configuration from JSON files
- Visualize ECUs (Electronic Control Units) and their connections to CAN buses
- Interactive drag-and-drop interface to rearrange ECUs
- Toggle ECUs between positions above or below the bus lines
- Color-coded buses for easier identification

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Upload a JSON file containing CAN network configuration
   - Use the "Browse Files" button or drag and drop a file
   - Alternatively, click "Load Sample Data" to see a demo

2. Interact with the visualization:
   - Drag ECU boxes to reposition them horizontally
   - Click the arrow buttons on ECUs to toggle their position above/below the buses
   - Use the controls in the bottom right to zoom and pan the view

## JSON Format

Your CAN network configuration should follow this format:

```json
{
  "can_channels": [
    {"node": "ECU1", "channels": ["Red", "Blue", "Yellow"]},
    {"node": "ECU2", "channels": ["Blue", "Green"]},
    {"node": "ECU3", "channels": ["Red", "Blue"]}
  ]
}
```

Where:
- `node`: The name of the ECU
- `channels`: Array of CAN bus names that the ECU connects to

## Technologies Used

- React
- TypeScript
- React Flow (for interactive network diagrams)

## License

MIT

## Acknowledgments

- Created as a tool for automotive network engineers and designers
- Inspired by the need for better visualization of CAN bus networks
