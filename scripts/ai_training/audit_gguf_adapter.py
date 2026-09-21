#!/usr/bin/env python3
"""
audit_gguf_adapter.py
======================
Forensic structural and semantic validator for GGUF LoRA adapters.
"""
import sys
import json
import hashlib
import numpy as np
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import gguf


def audit_gguf_adapter(gguf_path: str | Path, source_tensor_count: int = 392) -> dict:
    path = Path(gguf_path)
    if not path.exists():
        return {"valid": False, "error": f"File does not exist: {path}"}

    raw_bytes = path.read_bytes()
    file_size = len(raw_bytes)
    sha256_hash = hashlib.sha256(raw_bytes).hexdigest()

    # 1. Check Magic
    if raw_bytes[:4] != b"GGUF":
        return {"valid": False, "error": f"Invalid magic header: {raw_bytes[:4]!r}"}

    # 2. Open via GGUFReader
    try:
        reader = gguf.GGUFReader(path)
    except Exception as e:
        return {"valid": False, "error": f"Failed to parse GGUF structure: {e}"}

    # 3. Read metadata fields
    fields = {}
    for k, field in reader.fields.items():
        if field.types and field.types[0] == gguf.GGUFValueType.STRING:
            val = str(bytes(field.parts[-1]), encoding="utf-8", errors="replace")
        elif field.types and field.types[0] in (gguf.GGUFValueType.FLOAT32, gguf.GGUFValueType.FLOAT64):
            val = float(field.parts[-1][0])
        elif field.types and field.types[0] in (gguf.GGUFValueType.UINT32, gguf.GGUFValueType.INT32):
            val = int(field.parts[-1][0])
        else:
            val = str(field.data)
        fields[k] = val

    # Verify adapter metadata
    arch = fields.get("general.architecture", "")
    gen_type = fields.get("general.type", "")
    adapter_type = fields.get("adapter.type", "")
    alpha = fields.get("adapter.lora.alpha", 0.0)

    # 4. Inspect tensors
    tensors_info = []
    nan_inf_tensors = []
    all_zero_tensors = []
    
    for tensor in reader.tensors:
        t_name = tensor.name
        t_shape = [int(x) for x in tensor.shape]
        t_dtype = str(tensor.tensor_type.name)
        data = tensor.data

        # Check for NaN / Inf
        if np.issubdtype(data.dtype, np.floating):
            if np.isnan(data).any() or np.isinf(data).any():
                nan_inf_tensors.append(t_name)

        # Check for all zero
        if np.all(data == 0):
            all_zero_tensors.append(t_name)

        tensors_info.append({
            "name": t_name,
            "shape": t_shape,
            "dtype": t_dtype,
            "size_bytes": data.nbytes
        })

    tensor_count = len(reader.tensors)

    # Semantic checks
    errors = []
    if tensor_count != source_tensor_count:
        errors.append(f"GGUF tensor count ({tensor_count}) does not match source ({source_tensor_count})")
    if nan_inf_tensors:
        errors.append(f"Tensors contain NaN or Inf values: {nan_inf_tensors[:3]}")
    if len(all_zero_tensors) == tensor_count:
        errors.append("All tensors in GGUF adapter are zeros")

    valid = len(errors) == 0

    return {
        "valid": valid,
        "errors": errors,
        "file_size_bytes": file_size,
        "sha256": sha256_hash,
        "tensor_count": tensor_count,
        "architecture": arch,
        "general_type": gen_type,
        "adapter_type": adapter_type,
        "lora_alpha": alpha,
        "sample_tensors": tensors_info[:6],
        "all_zero_count": len(all_zero_tensors)
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python audit_gguf_adapter.py <path_to_adapter.gguf>")
        sys.exit(1)

    result = audit_gguf_adapter(sys.argv[1])
    print("\n" + "=" * 70)
    print("  GGUF ADAPTER FORENSIC AUDIT")
    print("=" * 70)
    print(json.dumps(result, indent=2))
    print("=" * 70)

    if result["valid"]:
        print("  [PASS] Valid GGUF LoRA adapter artifact")
        sys.exit(0)
    else:
        print("  [FAIL] Invalid artifact:", result.get("errors"))
        sys.exit(1)


if __name__ == "__main__":
    main()
