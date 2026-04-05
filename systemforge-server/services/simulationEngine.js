const Project = require('../models/Project');

// This object holds all currently running simulation loops
const activeSimulations = {}; 

const startSimulation = async (io, projectId) => {
  // If it's already running, don't start a duplicate loop
  if (activeSimulations[projectId]) return; 

  console.log(`Initializing simulation engine for project: ${projectId}`);

  // Fetch the current saved state of the canvas
  const project = await Project.findById(projectId);
  if (!project) return console.log('Project not found for simulation');

  // Load the nodes and edges into memory for fast calculation
  let nodes = JSON.parse(JSON.stringify(project.nodes));
  let edges = JSON.parse(JSON.stringify(project.edges));

  const TICK_RATE = 1000; // 1 second per tick (simulation day)

  // Start the mathematical loop!
  activeSimulations[projectId] = setInterval(() => {
    
    // --- 1. GENERATION PHASE ---
    // If a node is a 'factory' (source), it generates resources every tick
    nodes.forEach(node => {
      if (node.type === 'factory') {
        node.data.currentLoad += node.data.processingRate;
        // Cap it at max capacity
        if (node.data.currentLoad > node.data.maxCapacity) {
          node.data.currentLoad = node.data.maxCapacity;
        }
      }
    });

    // --- 2. TRANSFER PHASE ---
    // Move resources along the edges (pipes)
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);

      // If both nodes exist and the source has resources to give
      if (source && target && source.data.currentLoad > 0) {
        
        // The core math: How much can actually flow?
        const availableSpaceInTarget = target.data.maxCapacity - target.data.currentLoad;
        const flowAmount = Math.min(
          source.data.currentLoad, // What the source has available
          edge.data.maxFlow,       // The limit of the pipe/edge
          availableSpaceInTarget   // What the target can actually fit
        );

        // Move the resources
        source.data.currentLoad -= flowAmount;
        target.data.currentLoad += flowAmount;
        edge.data.currentFlow = flowAmount; // For the frontend to animate the line

      } else {
        edge.data.currentFlow = 0; // Turn off animation if empty
      }
    });

    // --- 3. BROADCAST PHASE ---
    // Send the freshly calculated state only to users viewing this specific project
    io.to(projectId).emit('tick_update', { 
      time: new Date(),
      nodes, 
      edges 
    });

  }, TICK_RATE);
};

const stopSimulation = (projectId) => {
  if (activeSimulations[projectId]) {
    clearInterval(activeSimulations[projectId]);
    delete activeSimulations[projectId];
    console.log(`Halted simulation engine for project: ${projectId}`);
    
    // Optional for later: Save the final state back to MongoDB here
  }
};

module.exports = { startSimulation, stopSimulation };