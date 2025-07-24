import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, AlertTriangle, CheckCircle, Cpu, Camera, BarChart3 } from 'lucide-react';

const ChipTracePrototype = () => {
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [currentWafer, setCurrentWafer] = useState(1);
  const [detectedDefects, setDetectedDefects] = useState([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [yieldRate, setYieldRate] = useState(94.2);
  const [totalWafersProcessed, setTotalWafersProcessed] = useState(1247);

  // Simulated wafer patterns and defects
  const waferPatterns = [
    { id: 1, defects: [
      { x: 150, y: 120, type: 'particle', severity: 'high', size: 8 },
      { x: 280, y: 200, type: 'scratch', severity: 'medium', size: 12 },
      { x: 320, y: 80, type: 'residue', severity: 'low', size: 6 }
    ]},
    { id: 2, defects: [
      { x: 200, y: 160, type: 'bridging', severity: 'critical', size: 10 },
      { x: 100, y: 250, type: 'particle', severity: 'medium', size: 7 }
    ]},
    { id: 3, defects: [
      { x: 250, y: 100, type: 'misalignment', severity: 'high', size: 15 },
      { x: 180, y: 300, type: 'etch_residue', severity: 'low', size: 5 },
      { x: 350, y: 180, type: 'particle', severity: 'medium', size: 9 }
    ]}
  ];

  const defectColors = {
    'critical': '#ff0000',
    'high': '#ff6600',
    'medium': '#ffaa00',
    'low': '#ffff00'
  };

  const defectTypes = {
    'particle': 'Metal Particle',
    'scratch': 'Surface Scratch',
    'residue': 'Chemical Residue',
    'bridging': 'Metal Bridging',
    'misalignment': 'Pattern Misalignment',
    'etch_residue': 'Etch Residue'
  };

  // Simulate wafer scanning with realistic timing
  const startScan = () => {
    if (isScanning) return;
    
    setIsScanning(true);
    setScanProgress(0);
    setProcessingTime(0);
    setDetectedDefects([]);

    const waferData = waferPatterns[currentWafer - 1] || waferPatterns[0];
    
    // Simulate progressive scanning
    let progress = 0;
    const scanInterval = setInterval(() => {
      progress += 2;
      setScanProgress(progress);
      setProcessingTime(prev => prev + 2);

      if (progress >= 100) {
        clearInterval(scanInterval);
        
        // Simulate AI processing delay
        setTimeout(() => {
          setDetectedDefects(waferData.defects);
          setIsScanning(false);
          setTotalWafersProcessed(prev => prev + 1);
          
          // Update yield rate based on defects
          const criticalDefects = waferData.defects.filter(d => d.severity === 'critical').length;
          const newYieldRate = Math.max(85, 98 - (criticalDefects * 2) - (waferData.defects.length * 0.5));
          setYieldRate(Number(newYieldRate.toFixed(1)));
        }, 500);
      }
    }, 25); // Real-time scanning simulation
  };

  const resetScan = () => {
    setIsScanning(false);
    setScanProgress(0);
    setProcessingTime(0);
    setDetectedDefects([]);
    setCurrentWafer(prev => prev < 3 ? prev + 1 : 1);
  };

  // Draw wafer and defects on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const waferRadius = 180;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw wafer base
    ctx.beginPath();
    ctx.arc(centerX, centerY, waferRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'linear-gradient(45deg, #1a1a2e, #16213e)';
    ctx.fill();
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw wafer grid pattern
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 0.5;
    for (let i = -waferRadius; i <= waferRadius; i += 20) {
      ctx.beginPath();
      ctx.moveTo(centerX + i, centerY - waferRadius);
      ctx.lineTo(centerX + i, centerY + waferRadius);
      ctx.stroke();
      
      ctx.beginPath();  
      ctx.moveTo(centerX - waferRadius, centerY + i);
      ctx.lineTo(centerX + waferRadius, centerY + i);
      ctx.stroke();
    }

    // Draw scanning progress
    if (isScanning) {
      const scanLine = (scanProgress / 100) * (waferRadius * 2);
      ctx.strokeStyle = '#00ff41';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - waferRadius, centerY - waferRadius + scanLine);
      ctx.lineTo(centerX + waferRadius, centerY - waferRadius + scanLine);
      ctx.stroke();

      // Scanning effect
      ctx.fillStyle = 'rgba(0, 255, 65, 0.1)';
      ctx.fillRect(centerX - waferRadius, centerY - waferRadius, waferRadius * 2, scanLine);
    }

    // Draw detected defects
    detectedDefects.forEach((defect, index) => {
      const x = centerX + defect.x - waferRadius;
      const y = centerY + defect.y - waferRadius;
      
      // Defect marker
      ctx.beginPath();
      ctx.arc(x, y, defect.size, 0, 2 * Math.PI);
      ctx.fillStyle = defectColors[defect.severity];
      ctx.fill();
      
      // Pulsing effect for critical defects
      if (defect.severity === 'critical') {
        ctx.beginPath();
        ctx.arc(x, y, defect.size + 5, 0, 2 * Math.PI);
        ctx.strokeStyle = defectColors[defect.severity];
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Defect label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText(`D${index + 1}`, x + defect.size + 2, y - defect.size - 2);
    });

    // Draw wafer ID
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`WAFER-${currentWafer.toString().padStart(3, '0')}`, centerX, centerY + waferRadius + 30);

  }, [scanProgress, detectedDefects, currentWafer, isScanning]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Cpu className="text-blue-400 mr-3" size={40} />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              ChipTrace
            </h1>
          </div>
          <p className="text-gray-300 text-lg">Real-time Semiconductor Defect Detection System</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Scanning Interface */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Camera className="mr-2 text-green-400" size={24} />
                Wafer Inspection
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={startScan}
                  disabled={isScanning}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Play size={16} />
                  {isScanning ? 'Scanning...' : 'Start Scan'}
                </button>
                <button
                  onClick={resetScan}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <RotateCcw size={16} />
                  Next Wafer
                </button>
              </div>
            </div>

            {/* Canvas for wafer visualization */}
            <div className="bg-black rounded-lg p-4 mb-4">
              <canvas
                ref={canvasRef}
                width={500}
                height={400}
                className="mx-auto block border border-gray-600 rounded"
              />
            </div>

            {/* Scan Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Scan Progress</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Processing Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">{processingTime}ms</div>
                <div className="text-sm text-gray-300">Processing Time</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">{detectedDefects.length}</div>
                <div className="text-sm text-gray-300">Defects Found</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-400">47ms</div>
                <div className="text-sm text-gray-300">AI Inference</div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* System Status */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="mr-2 text-yellow-400" size={20} />
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>AI Engine</span>
                  <span className="text-green-400 flex items-center">
                    <CheckCircle size={16} className="mr-1" />
                    Online
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Camera System</span>
                  <span className="text-green-400 flex items-center">
                    <CheckCircle size={16} className="mr-1" />
                    Ready
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Unit</span>
                  <span className="text-green-400 flex items-center">
                    <CheckCircle size={16} className="mr-1" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Production Metrics */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BarChart3 className="mr-2 text-blue-400" size={20} />
                Production Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Yield Rate</span>
                  <span className="text-green-400 font-bold">{yieldRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Wafers Processed</span>
                  <span className="text-blue-400 font-bold">{totalWafersProcessed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Processing</span>
                  <span className="text-purple-400 font-bold">42ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime</span>
                  <span className="text-green-400 font-bold">99.7%</span>
                </div>
              </div>
            </div>

            {/* Defect Analysis */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <AlertTriangle className="mr-2 text-orange-400" size={20} />
                Defect Analysis
              </h3>
              {detectedDefects.length > 0 ? (
                <div className="space-y-3">
                  {detectedDefects.map((defect, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">D{index + 1}</span>
                        <span 
                          className="px-2 py-1 rounded text-xs font-bold"
                          style={{ 
                            backgroundColor: defectColors[defect.severity] + '20',
                            color: defectColors[defect.severity]
                          }}
                        >
                          {defect.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">
                        <div>Type: {defectTypes[defect.type]}</div>
                        <div>Size: {defect.size}μm</div>
                        <div>Position: ({defect.x}, {defect.y})</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  {isScanning ? "Analyzing wafer..." : "No defects detected"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500">
          <p>ChipTrace v2.1 - Real-time AI-powered semiconductor inspection</p>
        </div>
      </div>
    </div>
  );
};

export default ChipTracePrototype;