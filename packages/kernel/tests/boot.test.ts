import { describe, it, expect, beforeEach } from 'vitest';
import { DependencyInjector } from '../src/di/DependencyInjector';
import { UniversalEventBus } from '../src/events/UniversalEventBus';
import { EventStore } from '../src/events/EventStore';
import { LifecycleManager } from '../src/lifecycle/LifecycleManager';
import { RuntimeEvent } from '@chatr/events';

describe('Kernel Boot Sequence (Slice 1)', () => {
  let di: DependencyInjector;
  let eventBus: UniversalEventBus;
  let eventStore: EventStore;
  let lifecycle: LifecycleManager;

  beforeEach(() => {
    di = new DependencyInjector();
    eventBus = new UniversalEventBus();
    eventStore = new EventStore();
    lifecycle = new LifecycleManager(di, eventBus, eventStore);

    di.registerInstance('DependencyInjector', di);
    di.registerInstance('UniversalEventBus', eventBus);
    di.registerInstance('EventStore', eventStore);
    di.registerInstance('LifecycleManager', lifecycle);
  });

  it('should boot deterministically and fire kernel.boot_complete', async () => {
    let bootCompleteFired = false;
    
    eventBus.subscribe('kernel.boot_complete', (payload) => {
      bootCompleteFired = true;
    });

    await lifecycle.boot();

    expect(lifecycle.getState()).toBe('booted');
    expect(bootCompleteFired).toBe(true);
  });

  it('should persist sourced events to the EventStore', async () => {
    await lifecycle.boot();
    
    const count = eventStore.getSequenceCount();
    expect(count).toBeGreaterThan(0);

    const events = [];
    for await (const stored of eventStore.replayAll()) {
      events.push(stored.event);
    }
    
    expect(events).toContain('kernel.boot_complete' as RuntimeEvent);
  });
});
