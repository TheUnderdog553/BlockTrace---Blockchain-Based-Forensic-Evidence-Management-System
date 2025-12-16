# Dockerfile for Evidence Chaincode (External Service)
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy chaincode source
COPY . .

# Expose chaincode port
EXPOSE 7052

# Start chaincode server
CMD ["node", "server.js"]
