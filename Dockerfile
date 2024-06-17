# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Expose the port HardHat node will run on
EXPOSE 8545

# Command to run your HardHat node and deploy the contracts
CMD ["sh", "-c", "npx hardhat node & sleep 5 && npx hardhat run scripts/deploy.js --network localhost"]
