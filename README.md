# microAttention
Scaled dot-product attention implemented from scratch in pure Python and NumPy. A learning artefact by AI governance practitioner Reita Williams.
[README.MD](https://github.com/user-attachments/files/26210500/README.MD)
# microAttention

I've been writing about transformer architecture for months arguing that 
the mechanism reveals something about whose language got centred, what gets 
lost when meaning becomes a matrix, and what these systems can and cannot 
hold. It's good work and I stand by it. At some point writing about the 
mechanism from the outside stops being enough. I wanted to demonstrate and show my theories. 
This project is a scaled dot-product attention implemented from 
scratch in pure Python and NumPy, it has no PyTorch, no abstractions, every line is
written to be understood rather than just to work.
This project serves as a learning artefact.

## What this project implements

- Scaled dot-product attention: Q, K, V projections, softmax, weighted sum
- Causal masking: tokens cannot attend to future positions
- A tiling optimisation pass, demonstrating the mechanism behind FlashAttention

---

## The benchmark finding

| n   | Baseline | Tiled   | Difference |
|-----|----------|---------|------------|
| 64  | 0.217ms  | 1.300ms | +500%      |
| 256 | 0.229ms  | 1.090ms | +376%      |
| 512 | 0.209ms  | 0.996ms | +378%      |

The tiling pass is slower at every scale tested.

The optimisation is designed for compiled kernels on large matrices. NumPy 
already implements cache-efficient matrix multiplication internally in C. A 
Python tiling loop cannot outperform BLAS. This implementation demonstrates 
the mechanism, not the performance claim. Understanding why FlashAttention is 
fast matters more than pretending to reproduce it in Python.

---

## What happened when I ran my own words through it
```python
sentence = ["the", "corpus", "was", "wrong"]
```

When I ran that sentence through the finished implementation, `'wrong'` 
attended most heavily to `'corpus'`  93.7%. The model found the relationship 
the essay was already making. That's just 
matrix multiplication doing exactly what it's supposed to do. Which is also, 
when you think about it, not nothing.

---

## Structure
```
microAttention/
├── microattention.py        core implementation
├── passes/
│   └── tiling.py            cache-aware optimization pass  
├── experiments/
│   └── benchmark.py         before/after timing
├── results/                 benchmark outputs
└── docs/
    └── notes.md             working notes
```
## Go deeper

- [Why I built this](motivation.md)
- [What attention actually is](what-is-attention.md)
- [The mathematics](Mathematics.md)
- [Code walkthrough](implementation.md)
- [The tiling pass and benchmark](tiling.md)
- [What this taught me about AI governance](governance.md)

## Run It 

```bash
pip install numpy
python microattention.py
python experiments/benchmark.py
```

---

## Built by

Reita Williams, AI Governance Practitioner.  
Writing at · [reita.dev](https://reita.dev) · [LinkedIn](https://www.linkedin.com/in/reita-williams) · [Medium](https://medium.com/@ReitaW) 

---

*Inspired by [microMLC](https://github.com/sakshambatra1/microMLC)*
