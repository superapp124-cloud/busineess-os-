import { ServiceRegistry } from '../Infrastructure/ServiceRegistry';
import { ConfigurationManager } from '../Infrastructure/Configuration';
import { OfflineManager } from '../Services/OfflineManager';
import { SyncManager } from '../Services/SyncManager';
import { NotificationManager } from '../Services/NotificationManager';
import { CollaborationBus } from '../Services/CollaborationBus';
import { HealthMonitor } from '../Services/HealthMonitor';
import { Metrics } from '../Services/Metrics';
import { AIPlatform } from '../Domain/AI/AIPlatform';
import { KnowledgeManager } from '../Services/KnowledgeManager';
import { MessagingService } from '../Domain/Communication/MessagingService';
import { TaskService } from '../Domain/Execution/TaskService';
import { CalendarService } from '../Domain/Execution/CalendarService';
import { Logger } from '../Infrastructure/Logger';
import { SearchService } from '../Domain/Knowledge/SearchService';
import { NotificationService } from '../Domain/Collaboration/NotificationService';
import { PresenceService } from '../Domain/Collaboration/PresenceService';
import { ActivityService } from '../Domain/Activity/ActivityService';

class CHATRRuntime {
  async start(): Promise<void> {
    Logger.info('[CHATR Runtime] Starting core services...');
    
    // Register all services
    ServiceRegistry.register(ConfigurationManager);
    ServiceRegistry.register(Metrics);
    ServiceRegistry.register(HealthMonitor);
    ServiceRegistry.register(OfflineManager);
    ServiceRegistry.register(SyncManager);
    ServiceRegistry.register(NotificationManager);
    ServiceRegistry.register(CollaborationBus);
    ServiceRegistry.register(AIPlatform);
    ServiceRegistry.register(KnowledgeManager);
    ServiceRegistry.register(MessagingService);
    ServiceRegistry.register(TaskService);
    ServiceRegistry.register(CalendarService);
    ServiceRegistry.register(SearchService);
    ServiceRegistry.register(NotificationService);
    ServiceRegistry.register(PresenceService);
    ServiceRegistry.register(ActivityService);

    // Initialize all (ServiceRegistry handles dependency ordering)
    await ServiceRegistry.initializeAll();
    
    Logger.info('[CHATR Runtime] Platform ready.');
  }
}

export const Runtime = new CHATRRuntime();
