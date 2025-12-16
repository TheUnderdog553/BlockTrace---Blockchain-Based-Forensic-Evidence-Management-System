/*
 * External Chaincode Server for Evidence Contract
 * Runs as a standalone service for Fabric 2.5+ external chaincode
 */

'use strict';

const shim = require('fabric-shim');
const { Contract, Context} = require('fabric-contract-api');
const EvidenceContract = require('./lib/evidenceContract');

class ChaincodeWrapper {
    constructor() {
        this.contract = new EvidenceContract();
    }

    async Init(stub) {
        console.log('Chaincode initialized');
        return shim.success();
    }

    async Invoke(stub) {
        try {
            const { fcn, params } = stub.getFunctionAndParameters();
            console.log(`Invoking function: ${fcn} with params:`, params);

            // Create context
            const ctx = new Context();
            ctx.stub = stub;
            ctx.clientIdentity = stub.getCreator ? new shim.ClientIdentity(stub) : {};

            // Call the contract method
            if (typeof this.contract[fcn] === 'function') {
                const result = await this.contract[fcn](ctx, ...params);
                return shim.success(Buffer.from(JSON.stringify(result || {})));
            } else {
                return shim.error(`Function ${fcn} not found`);
            }
        } catch (err) {
            console.error('Invoke error:', err);
            return shim.error(err.message);
        }
    }
}

const chaincode = new ChaincodeWrapper();
const server = shim.server(chaincode, {
    ccid: process.env.CHAINCODE_ID || 'evidence_1.0:59d480b000ff21ee2b3224fbeca21e77152e913984260dac302724eea5fe8301',
    address: '0.0.0.0:7052'
});

server.start().then(() => {
    console.log('Evidence chaincode server started on port 7052');
    console.log('CHAINCODE_ID:', process.env.CHAINCODE_ID);
}).catch(err => {
    console.error('Failed to start chaincode server:', err);
    process.exit(1);
});
