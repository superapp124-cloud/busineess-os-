'use strict';

/**
 * CHATR Kernel — Execution Graph (Phase 2)
 *
 * Orchestrates an Execution Plan sequentially.
 * Streams progress back to the UI via the Event Bus.
 */

const { bus } = require('../events/bus.cjs');
const { runtimeManager } = require('./runtime-manager.cjs');

const log = (() => {
  try { return require('electron-log'); } catch { return console; }
})();

class ExecutionGraph {
  constructor() {
    this.pendingApprovals = new Map();
  }

  approveNode(nodeId) {
    if (this.pendingApprovals.has(nodeId)) {
      const { resolve } = this.pendingApprovals.get(nodeId);
      resolve();
      this.pendingApprovals.delete(nodeId);
      return true;
    }
    return false;
  }

  rejectNode(nodeId) {
    if (this.pendingApprovals.has(nodeId)) {
      const { reject } = this.pendingApprovals.get(nodeId);
      reject(new Error('User rejected the execution of this capability.'));
      this.pendingApprovals.delete(nodeId);
      return true;
    }
    return false;
  }

  /**
   * Execute the graph sequentially.
   * @param {object} plan
   */
  async execute(plan) {
    const results = {};
    const metadata = {
      planId: plan.intentId,
      startedAt: new Date().toISOString(),
      nodes: []
    };

    bus.publish('execution:plan_started', { intentId: plan.intentId, nodeCount: plan.nodes.length });

    for (const node of plan.nodes) {
      const startTime = Date.now();
      bus.publish('execution:node_started', { intentId: plan.intentId, node });
      const manifest = runtimeManager.getCapability(node.capability);
      const runtimeName = node.runtime || manifest?.runtime;

      const nodeResult = {
        id: node.id,
        runtime: runtimeName,
        capability: node.capability,
        status: 'pending',
        confidence: node.confidence,
        startedAt: new Date().toISOString(),
        durationMs: 0,
        approval: node.requiresApproval,
        locality: 'local', // Tracking execution locality (local, local_app, cloud)
        output: null,
        error: null
      };

      try {
        // If approval is required, emit an approval required event and PAUSE.
        if (node.requiresApproval) {
          bus.publish('execution:node_awaiting_approval', { intentId: plan.intentId, node });
          log.info(`[ExecutionGraph] Node '${node.id}' paused, awaiting user approval.`);
          await new Promise((resolve, reject) => {
            this.pendingApprovals.set(node.id, { resolve, reject });
          });
          log.info(`[ExecutionGraph] Node '${node.id}' approved. Resuming execution.`);
          bus.publish('execution:node_approved', { intentId: plan.intentId, node });
        }

        // Check if capability is registered
        if (runtimeManager.hasCapability(node.capability)) {
           const runtime = runtimeManager.getRuntime(runtimeName);
           const parameters = node.parameters || {};

           if (runtime && runtime.name === 'ExecutionRuntime' && typeof runtime.execute === 'function') {
              nodeResult.output = await runtime.execute(node.capability, parameters, {
                intentId: plan.intentId,
                intent: plan.originalText,
                previousResults: results,
                approvalGranted: !!node.requiresApproval
              });
           } else {
              // We extract the base capability action (e.g., memory.search -> search)
              const method = node.capability.split('.')[1];

              if (runtime && typeof runtime[method] === 'function') {
                 nodeResult.output = await runtime[method](parameters);
              } else {
                 nodeResult.output = { fallback: true, mockMessage: `Executed ${node.capability} (No Provider bound)` };
              }
           }
        } else if (node.capability === 'memory.search') {
           // Direct binding to PowerShell script for local search
           const { app } = require('electron');
           const path = require('path');
           const { execFile } = require('child_process');
           const psScriptPath = path.join(app.getPath('userData'), 'agent-search.ps1');
           
           nodeResult.output = await new Promise((resolve) => {
             const searchTerm = node.parameters.query || '';
             execFile('powershell.exe', [
                 '-NoProfile', 
                 '-ExecutionPolicy', 'Bypass', 
                 '-File', psScriptPath, 
                 '-SearchTerm', searchTerm
             ], (error, stdout, stderr) => {
               if (error) {
                 resolve({ error: "Search failed: " + error.message });
                 return;
               }
               try {
                 const parsed = JSON.parse(stdout || "[]");
                 const arrayResult = Array.isArray(parsed) ? parsed : [parsed];
                 const files = arrayResult.filter(i => i && i.FullName).map(i => i.FullName);
                 resolve({ found: files.length > 0, files: files.map(f => ({ name: f })) });
               } catch(e) {
                 resolve({ found: false, files: [] });
               }
             });
           });
        } else {
           // Fallback for demo if providers aren't fully linked
           nodeResult.output = { simulated: true, action: node.action };
           await new Promise(resolve => setTimeout(resolve, 800)); // Simulate work
        }

        nodeResult.status = 'completed';
      } catch (err) {
        nodeResult.status = 'failed';
        nodeResult.error = err.message;
      }

      nodeResult.finishedAt = new Date().toISOString();
      nodeResult.durationMs = Date.now() - startTime;
      metadata.nodes.push(nodeResult);
      results[node.id] = nodeResult;

      bus.publish('execution:node_completed', { intentId: plan.intentId, nodeResult });

      if (nodeResult.status === 'failed') {
        break; // Stop execution on failure
      }
    }

    metadata.finishedAt = new Date().toISOString();
    metadata.totalDurationMs = new Date(metadata.finishedAt) - new Date(metadata.startedAt);
    
    console.log('[DEBUG_RESULTS]', JSON.stringify(results, null, 2));
    bus.publish('execution:plan_completed', { intentId: plan.intentId, results, metadata });
    return metadata;
  }
}

const executionGraph = new ExecutionGraph();
module.exports = { executionGraph, ExecutionGraph };
