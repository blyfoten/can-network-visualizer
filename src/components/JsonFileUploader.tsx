import React, { useRef } from 'react';
import { CanNetworkData } from '../types/can-network';

interface JsonFileUploaderProps {
  onFileLoaded: (data: CanNetworkData) => void;
}

const JsonFileUploader: React.FC<JsonFileUploaderProps> = ({ onFileLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Validate the JSON structure has can_channels
        if (!jsonData.can_channels || !Array.isArray(jsonData.can_channels)) {
          alert('Invalid JSON format. The file must contain a "can_channels" array.');
          return;
        }
        
        onFileLoaded(jsonData);
      } catch (error) {
        alert('Error parsing JSON file: ' + (error as Error).message);
      }
    };
    
    reader.readAsText(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Validate the JSON structure has can_channels
        if (!jsonData.can_channels || !Array.isArray(jsonData.can_channels)) {
          alert('Invalid JSON format. The file must contain a "can_channels" array.');
          return;
        }
        
        onFileLoaded(jsonData);
      } catch (error) {
        alert('Error parsing JSON file: ' + (error as Error).message);
      }
    };
    
    reader.readAsText(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Sample data for demo purposes
  const handleLoadSampleData = () => {
    const sampleData: CanNetworkData = {
      can_channels: [
        { node: "ECU1", channel_names: ["Red", "Blue", "Yellow"] },
        { node: "ECU2", channel_names: ["Blue", "Green"] },
        { node: "ECU3", channel_names: ["Red", "Blue"] }
      ]
    };
    
    onFileLoaded(sampleData);
  };

  return (
    <div 
      className="json-file-uploader"
      style={{
        margin: '20px 0',
        padding: '20px',
        border: '2px dashed #ccc',
        borderRadius: '5px',
        textAlign: 'center'
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <h3>Upload CAN Network JSON</h3>
      <p>Drag and drop a JSON file or click to browse</p>
      <p style={{ fontSize: '12px', color: '#666' }}>
        The system supports layout information in JSON format. 
        If your file includes a "layout" property with node positions, they will be restored.
      </p>
      
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={handleBrowseClick}
          style={{
            padding: '8px 16px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Browse Files
        </button>
        
        <button
          onClick={handleLoadSampleData}
          style={{
            padding: '8px 16px',
            background: '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Load Sample Data
        </button>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        style={{ display: 'none' }} 
        accept=".json"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default JsonFileUploader; 