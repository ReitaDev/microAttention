import numpy as np
import math
from microattention import softmax


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