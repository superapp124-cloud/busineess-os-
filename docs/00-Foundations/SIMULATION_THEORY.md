# 00-Foundations — Simulation Theory (docs/00-Foundations/SIMULATION_THEORY.md)

> **Status**: Permanent Simulation Theory Specification  
> **Scope**: Scenario generation, Monte Carlo sampling, and continuous trajectory exploration.

---

## 1. Scenario Generation Engine

Prior to dispatching high-impact capabilities, the Simulation Engine executes Monte Carlo simulations across $N$ parallel futures:

$$\{ \text{Trajectory}_1, \text{Trajectory}_2, \dots, \text{Trajectory}_N \} \sim P(\text{State}_{t+1:t+T} \mid \text{State}_t, \text{Action}_t)$$

---

## 2. Sensitivity Analysis Calculus

Identifies critical system variables where small fluctuations produce disproportional impact on overall outcome utility:

$$S_{i, j} = \frac{\partial \mathcal{U}}{\partial x_j} \cdot \frac{x_j}{\mathcal{U}}$$
