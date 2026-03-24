import numpy as np
import sys
import os
import time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from microattention import scaled_dot_product_attention, causal_mask
from passes.tiling import tiled_attention

np.random.seed(42)
n, d_k = 512, 512

W_Q = np.random.randn(d_k, d_k)
W_K = np.random.randn(d_k, d_k)
W_V = np.random.randn(d_k, d_k)
X = np.random.randn(n, d_k)

Q = X @ W_Q
K = X @ W_K
V = X @ W_V
mask = causal_mask(n)

runs = 200

start = time.perf_counter()
for _ in range(runs):
    scaled_dot_product_attention(Q, K, V, mask)
baseline = (time.perf_counter() - start) / runs * 1000

start = time.perf_counter()
for _ in range(runs):
    tiled_attention(Q, K, V, tile_size=8, mask=mask)
tiled = (time.perf_counter() - start) / runs * 1000

print(f"Baseline attention: {baseline:.3f}ms")
print(f"Tiled attention:    {tiled:.3f}ms")
print(f"Difference:         {((tiled - baseline) / baseline * 100):.1f}%")