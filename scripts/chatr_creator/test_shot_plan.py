import sys
sys.path.insert(0, '.')
from scripts.chatr_creator.shot_planner_py import build_shot_plan_py
import json

plan = build_shot_plan_py(
    'test_ep001',
    'REACTION',
    'saket_cafe',
    'Okay so listen — yaar sach mein, main ek cheez dekhi. This is genuinely insane to me. Main samajhna chahti hoon kya hua. Be honest with me yaar.',
    []
)
print('Shot plan OK:')
print('  Shots:', len(plan['shots']))
print('  Duration:', plan['totalDurationSec'], 's')
print('  Errors:', plan['validationErrors'])
for s in plan['shots']:
    print('  Shot', s['shotNumber'], ':', s['meeraAction'], '|', s['backgroundVideoQuery'][:40])
