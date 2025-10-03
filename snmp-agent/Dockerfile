FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# SNMP ports
EXPOSE 161/udp 162/udp

CMD ["node", "src/agent.js"]