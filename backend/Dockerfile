# Use official Node.js image
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port (5050 matched to .env configurations)
EXPOSE 5050

# Start Express server
CMD ["npm", "start"]
