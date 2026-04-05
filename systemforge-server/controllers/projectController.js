const Project = require('../models/Project');

// @desc    Create a new project (Empty Canvas)
// @route   POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Create a new project with empty arrays for nodes and edges
    const project = await Project.create({
      userId: req.user._id,
      name,
      description,
      nodes: [],
      edges: []
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all projects (For a dashboard view)
// @route   GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    // Fetch all projects, but exclude the heavy node/edge data to load fast
    const projects = await Project.find().select('-nodes -edges');
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get a single project (Load the canvas)
// @route   GET /api/projects/:id
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update project state (Save the canvas)
// @route   PUT /api/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const { name, description, nodes, edges } = req.body;
    
    // Find the project and update it with the incoming arrays
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          name, 
          description, 
          nodes: nodes || [], 
          edges: edges || [] 
        } 
      },
      { new: true } // Return the updated document
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(updatedProject);
  } catch (error) {
    console.error("Error saving project:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};