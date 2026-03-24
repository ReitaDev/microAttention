import numpy as np
import math


def softmax(x):
    e_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return e_x / e_x.sum(axis=-1, keepdims=True)


def causal_mask(n):
    return np.triu(np.full((n, n), -1e9), k=1)


def scaled_dot_product_attention(Q, K, V, mask=None):
    scores = Q @ K.T / math.sqrt(Q.shape[-1])
    if mask is not None:
        scores = scores + mask
    weights = softmax(scores)
    return weights @ V, weights


if __name__ == "__main__":
    sentence = ["the", "corpus", "was", "wrong"]

    np.random.seed(42)
    token_embeddings = np.random.randn(len(sentence), 8)

    d_k = 8
    W_Q = np.random.randn(8, d_k)
    W_K = np.random.randn(8, d_k)
    W_V = np.random.randn(8, d_k)

    Q = token_embeddings @ W_Q
    K = token_embeddings @ W_K
    V = token_embeddings @ W_V

    mask = causal_mask(len(sentence))
    output, weights = scaled_dot_product_attention(Q, K, V, mask)

    print("Sentence:", sentence)
    print("\nAttention weights:")
    for i, word in enumerate(sentence):
        print(f"  '{word}' attends to:", {sentence[j]: round(weights[i][j], 3) for j in range(len(sentence))})