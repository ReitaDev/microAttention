# The tiling pass

After the attention implementation was working I wrote a second version that tiles the computation, meaning instead of computing the full score matrix in one operation it processes the input in small blocks, one tile at a time. The purpose of this, in theory, is to keep the working data inside the processor's fast cache rather than having to fetch it from slower main memory. In practice, in this implementation, it made things slower. I want to explain both the idea and the result, because the result is actually more interesting than if the tiling had worked.

![Memory hierarchy and the tiling concept: keeping tiles in fast cache rather than loading the whole matrix from DRAM](assets/tiling.svg)

---

## Why cache locality matters, and to whom

Modern processors have multiple layers of memory. There is the main memory, which is large and slow, and there are caches — L1, L2, L3 — which are progressively smaller and progressively faster, sitting much closer to the processor. When you do a computation that requires data, the processor checks whether that data is already in cache. If it is, it proceeds immediately. If it is not, it has to go out to main memory to fetch it, which can cost a hundred times as much time. This is called a cache miss, and it is one of the primary bottlenecks in large matrix computations.

The full attention score matrix for a sequence of n tokens is n × n in size. For short sequences this is small. But the cost of attention scales quadratically with sequence length, so for long sequences the score matrix can become very large, much larger than will fit in L1 or L2 cache, and computing it in a single pass means the processor spends significant time fetching data from main memory rather than doing arithmetic.

Tiling is the approach of breaking the computation into smaller blocks that fit comfortably in fast cache. Instead of computing the entire Q Kᵀ matrix at once, you compute a tile of it, use it, and then move to the next tile. The data you need is always close by. This is the intuition behind FlashAttention, which achieves significant speed improvements on GPU hardware by carefully managing what sits in the GPU's very fast SRAM versus its larger but slower high-bandwidth memory.

---

## What the tiling code does

```python
def tiled_attention(Q, K, V, tile_size=2, mask=None):
    n = Q.shape[0]
    d_k = Q.shape[-1]
    output = np.zeros_like(Q)
    for i in range(0, n, tile_size):
        Q_tile = Q[i:i+tile_size]
        scores_tile = np.zeros((Q_tile.shape[0], n))
        for j in range(0, n, tile_size):
            K_tile = K[j:j+tile_size]
            scores_tile[:, j:j+tile_size] = Q_tile @ K_tile.T / math.sqrt(d_k)
        if mask is not None:
            scores_tile += mask[i:i+tile_size]
        weights_tile = softmax(scores_tile)
        output[i:i+tile_size] = weights_tile @ V
    return output
```

The outer loop iterates over tiles of queries. The inner loop iterates over tiles of keys. For each query tile, we compute that tile's attention scores against all key tiles, assemble the full row of scores, apply the mask and softmax, and then compute the contribution to the output. Tile size of 2 means we are processing two tokens at a time.

The logic is correct and the output matches the baseline. The problem is that this is Python.

---

## What the benchmark found

| sequence length | baseline | tiled | difference |
|---|---|---|---|
| n = 64 | 0.217 ms | 1.300 ms | +499% |
| n = 256 | 0.229 ms | 1.090 ms | +376% |
| n = 512 | 0.209 ms | 0.996 ms | +378% |

Tiled is slower at every scale. The gap is largest at n = 64, and it does not close as sequences get longer — it plateaus somewhere around 380% overhead and stays there. This is telling you something specific.

NumPy's matrix operations are not written in Python. They are backed by BLAS, which is compiled C or Fortran that has been hand-optimised for decades, with cache-aware tiling and vectorised instructions already built in. When the baseline calls `Q @ K.T`, it is not doing a Python loop over matrix elements, it is calling a single BLAS routine that is already doing everything the tiling code was trying to do, but better. The Python loop overhead in the tiling version is paid on top of all that, rather than instead of it, and the result is that the abstraction penalty is all cost and no benefit.

The gap plateauing rather than growing with sequence length is the part I find interesting. At n = 512 you would expect the cache pressure to be higher and the tiling benefit to start showing through, but it does not, which confirms that the bottleneck is the Python loop itself and not memory bandwidth. The loop overhead is constant per iteration and it dominates regardless of how large the matrix is.

---

## What this teaches

When I started this I framed the tiling pass as "your Saksham moment",  a reference to the microMLC project that inspired this one, where the optimisation pass produced genuine acceleration. My version produced the opposite, and I think that is worth being honest about rather than glossing over.

FlashAttention's tiling gains come from operating at the level where the data is actually moving, GPU kernels written in CUDA, managing SRAM directly, fusing operations to avoid unnecessary reads and writes. You cannot get there from Python loops and NumPy,  implementation layer is wrong. The mechanism I built demonstrates what tiling is attempting to do. It does not demonstrate the performance claim, and the benchmark is evidence of that rather than a failure of the approach.

The thing that transfers, from this implementation to FlashAttention to any cache-aware linear algebra, is the underlying understanding: arithmetic is cheap, memory movement is expensive, and the architecture of a system that runs fast is fundamentally about keeping data close to where the computation is happening. That understanding is the thing this project was building, and the benchmark result confirms it in a way that a successful speedup would not have.

---

→ [Back to the implementation](implementation.md) · [Next: what this taught me about governance](governance.md)
