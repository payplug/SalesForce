'use strict';

const server = require('server');

const OneySimulation = require('~/cartridge/scripts/middleware/OneySimulation');

server.extend(module.superModule);

server.append('Show', OneySimulation.applySimulationInViewData);

module.exports = server.exports();