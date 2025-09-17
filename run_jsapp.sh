#!/bin/bash

# Run JS server
echo "Starting JS App Server..."
cd "JS App/backend" || exit
npm install
cd ..
npm run server &  # Run in background