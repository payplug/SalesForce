'use strict';

const server = require('server');

const OneySimulation = require('~/cartridge/scripts/middleware/OneySimulation');

server.extend(module.superModule);


server.append('Show', OneySimulation.applySimulationInViewDataProduct);

module.exports = server.exports();