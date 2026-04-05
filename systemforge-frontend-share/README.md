# SystemForge Frontend

## Setup

npm install  
npm run dev  

## Backend

Set URL in `.env`:

VITE_BACKEND_URL=http://localhost:5000

## Usage

- Drag nodes
- Drop on canvas
- Click node to edit
- Click "Start Simulation"

## Backend Contract

start_simulation → starts simulation  
tick_update → sends data

Example:
{
  "1": { "value": 50 }
}