#!/usr/bin/env python3
"""
audit_gguf_tensor_mapping.py
============================
Phase 4: Deep 392-Tensor Numerical Transformation Audit.
Fulfills Amendment 3:
  - Source tensor -> converter transformation -> GGUF tensor
  - Computes max_abs_error, mean_abs_error, relative_error, and elementwise numerical equivalence
  - Verifies exact 1-to-1 bijective mapping:
      Source Tensor Set == Expected Converter Output Tensor Set
  - L2 norm alone is NOT accepted.
"""
import sys
import json
import numpy as np
from pathlib import Path
import gguf
from safetensors import safe_open

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

REPO_ROOT = Path(__file__).resolve().parents[2]
SAFETENSORS_PATH = REPO_ROOT / "data/adapters/capabilities/business/v1/adapter_model.safetensors"
GGUF_PATH = REPO_ROOT / "data/adapters/capabilities/business/v1/adapter_model.gguf"
REPORT_OUTPUT = REPO_ROOT / "reports/gguf_adapter_tensor_mapping_audit.json"

# llama.cpp conversion rules for Qwen2 LoRA
MODULE_MAP = {
    "self_attn.q_proj": "attn_q.weight",
    "self_attn.k_proj": "attn_k.weight",
    "self_attn.v_proj": "attn_v.weight",
    "self_attn.o_proj": "attn_output.weight",
    "mlp.gate_proj": "ffn_gate.weight",
    "mlp.up_proj": "ffn_up.weight",
    "mlp.down_proj": "ffn_down.weight",
}

def map_peft_to_gguf_name(peft_name: str) -> str:
    # Example: base_model.model.model.layers.0.self_attn.q_proj.lora_A.weight
    # Target:  blk.0.attn_q.weight.lora_a
    parts = peft_name.split(".")
    # Find layer index
    layer_idx = None
    for i, p in enumerate(parts):
        if p == "layers" and i + 1 < len(parts):
            layer_idx = parts[i + 1]
            break
            
    if layer_idx is None:
        raise ValueError(f"Could not extract layer index from: {peft_name}")
        
    is_lora_a = "lora_A" in peft_name
    is_lora_b = "lora_B" in peft_name
    lora_suffix = ".lora_a" if is_lora_a else ".lora_b"
    
    # Identify target module
    target_mod = None
    for k, v in MODULE_MAP.items():
        if k in peft_name:
            target_mod = v
            break
            
    if target_mod is None:
        raise ValueError(f"Could not match module mapping for: {peft_name}")
        
    return f"blk.{layer_idx}.{target_mod}{lora_suffix}"

def run_audit():
    print(f"Loading Source LoRA Safetensors: {SAFETENSORS_PATH}")
    assert SAFETENSORS_PATH.exists(), f"Missing: {SAFETENSORS_PATH}"
    assert GGUF_PATH.exists(), f"Missing: {GGUF_PATH}"
    
    source_tensors = {}
    with safe_open(str(SAFETENSORS_PATH), framework="numpy") as f:
        for k in f.keys():
            source_tensors[k] = f.get_tensor(k)
            
    print(f"Source safetensors contains {len(source_tensors)} tensors.")
    
    print(f"Loading Target GGUF: {GGUF_PATH}")
    reader = gguf.GGUFReader(str(GGUF_PATH))
    gguf_tensors = {}
    for t in reader.tensors:
        gguf_tensors[t.name] = t
        
    print(f"Target GGUF contains {len(gguf_tensors)} tensors.")
    
    # Audit 1: Check bijective mapping
    expected_gguf_names = {}
    for k in source_tensors.keys():
        gguf_name = map_peft_to_gguf_name(k)
        expected_gguf_names[k] = gguf_name
        
    source_set = set(expected_gguf_names.values())
    target_set = set(gguf_tensors.keys())
    
    missing_in_gguf = source_set - target_set
    unexpected_in_gguf = target_set - source_set
    
    print(f"Bijective mapping check:")
    print(f"  Expected GGUF tensors: {len(source_set)}")
    print(f"  Found GGUF tensors:    {len(target_set)}")
    print(f"  Missing in GGUF:       {len(missing_in_gguf)}")
    print(f"  Unexpected in GGUF:    {len(unexpected_in_gguf)}")
    
    # Audit 2: Elementwise numerical equivalence check
    tensor_records = []
    max_global_abs_error = 0.0
    mean_global_abs_error = 0.0
    total_elements = 0
    mismatched_tensors = 0
    allclose_passed_tensors = 0
    exact_equal_tensors = 0
    
    for peft_name, src_arr in source_tensors.items():
        gguf_name = expected_gguf_names[peft_name]
        gguf_t = gguf_tensors.get(gguf_name)
        if gguf_t is None:
            continue
            
        gguf_arr = gguf_t.data
        
        # GGUF tensors in llama.cpp might be stored with GGML shape ordering (reversed)
        # Check if shape matches directly or if transpose is needed
        src_shape = list(src_arr.shape)
        gguf_shape = list(gguf_arr.shape)
        
        # In NumPy reader, let's compare both direct and transposed if shapes are inverted
        if src_shape != gguf_shape and src_shape == gguf_shape[::-1]:
            compare_arr = gguf_arr.T
            transformation_notes = "GGUF shape inverted (GGML column-major convention), transposed for comparison"
        else:
            compare_arr = gguf_arr
            transformation_notes = "Direct shape match"
            
        # Ensure float32 for comparison
        src_f32 = src_arr.astype(np.float32)
        cmp_f32 = compare_arr.astype(np.float32)
        
        abs_diff = np.abs(src_f32 - cmp_f32)
        max_err = float(np.max(abs_diff))
        mean_err = float(np.mean(abs_diff))
        src_max = float(np.max(np.abs(src_f32)))
        rel_err = max_err / (src_max + 1e-9)
        
        is_exact = bool(np.array_equal(src_f32, cmp_f32))
        is_allclose = bool(np.allclose(src_f32, cmp_f32, atol=1e-5, rtol=1e-5))
        
        if is_exact:
            exact_equal_tensors += 1
        if is_allclose:
            allclose_passed_tensors += 1
        else:
            mismatched_tensors += 1
            
        num_elems = src_f32.size
        total_elements += num_elems
        mean_global_abs_error += mean_err * num_elems
        if max_err > max_global_abs_error:
            max_global_abs_error = max_err
            
        tensor_records.append({
            "peft_name": peft_name,
            "gguf_name": gguf_name,
            "source_shape": src_shape,
            "gguf_shape": gguf_shape,
            "source_dtype": str(src_arr.dtype),
            "gguf_dtype": str(gguf_t.tensor_type.name),
            "transformation_notes": transformation_notes,
            "num_elements": num_elems,
            "source_l2_norm": float(np.linalg.norm(src_f32)),
            "gguf_l2_norm": float(np.linalg.norm(cmp_f32)),
            "max_abs_error": max_err,
            "mean_abs_error": mean_err,
            "relative_error": rel_err,
            "is_exact_equal": is_exact,
            "is_allclose": is_allclose
        })
        
    mean_global_abs_error = mean_global_abs_error / total_elements if total_elements > 0 else 0.0
    
    print("\nNumerical Equivalence Results:")
    print(f"  Total Tensors Audited:     {len(tensor_records)}")
    print(f"  Exact Bit-Equal Tensors:   {exact_equal_tensors}/{len(tensor_records)}")
    print(f"  allclose (1e-5) Passed:    {allclose_passed_tensors}/{len(tensor_records)}")
    print(f"  Mismatched Tensors:        {mismatched_tensors}/{len(tensor_records)}")
    print(f"  Max Global Abs Error:      {max_global_abs_error:.8e}")
    print(f"  Mean Global Abs Error:     {mean_global_abs_error:.8e}")
    
    verdict = (
        len(missing_in_gguf) == 0 and
        len(unexpected_in_gguf) == 0 and
        mismatched_tensors == 0 and
        allclose_passed_tensors == 392
    )
    import time
    report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "architecture": "qwen2",
        "audit_verdict": "PASS" if verdict else "FAIL",
        "safetensors_path": str(SAFETENSORS_PATH),
        "gguf_path": str(GGUF_PATH),
        "summary": {
            "total_tensors": len(tensor_records),
            "exact_equal_tensors": exact_equal_tensors,
            "allclose_passed_tensors": allclose_passed_tensors,
            "mismatched_tensors": mismatched_tensors,
            "max_global_abs_error": max_global_abs_error,
            "mean_global_abs_error": mean_global_abs_error,
            "missing_in_gguf_count": len(missing_in_gguf),
            "unexpected_in_gguf_count": len(unexpected_in_gguf)
        },
        "detailed_tensor_records": tensor_records
    }
    
    REPORT_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(REPORT_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
        
    print(f"\nAudit complete! Verdict: {'PASS' if verdict else 'FAIL'}")
    print(f"Report saved to: {REPORT_OUTPUT}")

if __name__ == "__main__":
    run_audit()
