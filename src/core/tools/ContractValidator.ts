import { EnterpriseEvent, EnterpriseObject, GraphEdge, MissionExecutionContext, InferenceHypothesis } from '../../types';

export class ContractValidator {
  
  public static validateEvent(event: any): event is EnterpriseEvent {
    if (!event.id || !event.type || !event.schemaVersion || !event.tenantId || !event.actorId || !event.source || !event.aggregateId || !event.aggregateKind || !event.occurredAt || !event.idempotencyKey) {
      throw new Error(`[ContractValidator] Malformed EnterpriseEvent: Missing required fields.`);
    }
    return true;
  }

  public static validateObject(obj: any): obj is EnterpriseObject {
    if (!obj.id || !obj.type || !obj.name || !obj.properties || !obj.lifecycleState || !obj.classification) {
      throw new Error(`[ContractValidator] Malformed EnterpriseObject.`);
    }
    return true;
  }

  public static validateEdge(edge: any): edge is GraphEdge {
    if (!edge.id || !edge.sourceId || !edge.targetId || !edge.relationship || !edge.confidence) {
      throw new Error(`[ContractValidator] Malformed GraphEdge.`);
    }
    return true;
  }

  public static validateMission(mission: any): mission is MissionExecutionContext {
    if (!mission.id || !mission.mission || !mission.lifecycleState || !mission.trigger) {
      throw new Error(`[ContractValidator] Malformed MissionExecutionContext.`);
    }
    return true;
  }

  public static validateHypothesis(hyp: any): hyp is InferenceHypothesis {
    if (!hyp.id || !hyp.type || !hyp.pluginId || hyp.confidence === undefined || !hyp.evidence || !hyp.reasoningPath) {
      throw new Error(`[ContractValidator] Malformed InferenceHypothesis: Missing intrinsic explainability fields.`);
    }
    return true;
  }
}
