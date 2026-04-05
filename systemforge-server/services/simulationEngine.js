const Project = require('../models/Project');

// This object holds all currently running simulation loops
const activeSimulations = {}; 

const startSimulation = async (io, projectId) => {
  // If it's already running, don't start a duplicate loop
  if (activeSimulations[projectId]) return; 

  console.log(`Initializing simulation engine for project: ${projectId}`);

  try {
    // Fetch the current saved state of the canvas
    const project = await Project.findById(projectId);
    
    // CRITICAL SAFETY CHECK
    if (!project || !project.nodes || project.nodes.length === 0) {
      console.log('No nodes found in DB! Please save the circuit first.');
      return; 
    }

    // Load the nodes and edges into memory for fast calculation
    let nodes = JSON.parse(JSON.stringify(project.nodes));
    let edges = JSON.parse(JSON.stringify(project.edges));

    const TICK_RATE = 1000; // 1 second per tick

    // Start the mathematical loop
    activeSimulations[projectId] = setInterval(() => {
      
      // --- 1. GENERATION PHASE ---
      nodes.forEach(node => {
        // Only run math if the node is NOT locked manually by the user
        if (!node.data.locked) {
          // Increase value by the rate
          node.data.value += node.data.rate;
          
          // Cap it at max capacity
          if (node.data.value > node.data.capacity) {
            node.data.value = node.data.capacity;
          }

          // Set overload status for the frontend to turn red
          node.data.overloaded = node.data.value >= node.data.overload_threshold;
        }
      });

      // --- 2. TRANSFER PHASE (Edges) ---
      edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);

        // If both nodes exist and the source has value to give
        if (source && target && source.data.value > 0 && !source.data.locked) {
          
          // Calculate flow physics
          const availableSpaceInTarget = target.data.capacity - target.data.value;
          const flowAmount = Math.min(
            source.data.value,       // What the source has
            10,                      // Edge flow speed limit
            availableSpaceInTarget   // What the target can fit
          );

          // Move the resources
          source.data.value -= flowAmount;
          target.data.value += flowAmount;
        }
      });

      // --- 3. BROADCAST PHASE ---
      io.to(projectId).emit('tick_update', { 
        time: new Date(),
        nodes, 
        edges 
      });

    }, TICK_RATE);

  } catch (err) {
    console.error("Simulation Engine Error:", err);
  }
};

const stopSimulation = (projectId) => {
  if (activeSimulations[projectId]) {
    clearInterval(activeSimulations[projectId]);
    delete activeSimulations[projectId];
    console.log(`Halted simulation engine for project: ${projectId}`);
  }
};

module.exports = { startSimulation, stopSimulation };