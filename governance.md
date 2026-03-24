# What this taught me about AI governance

I want to be careful here about what kind of claim I am making. I am not going to say that building an attention mechanism from scratch gave me new policy ideas, or that it produced insights I could not have arrived at through reading and analysis. That would be overstating it. What it did, which is a different and I think more durable thing, is change the texture of the understanding I already had. It moved things from being known to being felt, which is not nothing, and which I think matters for the kind of governance work I am actually trying to do.

---

## The gap closes differently when you have built the thing

A significant part of AI governance writing, including my own, works by identifying the gap between what a system appears to do and what it is actually doing. The argument goes something like: these systems are presented as intelligent, as understanding, as making judgements, and they are doing none of those things in any meaningful sense, and that gap between appearance and mechanism is where harm enters, because policy gets built around the appearance rather than the mechanism.

That argument is correct. But there is a difference between knowing it is correct and having a clear enough picture of the mechanism that you can hold both sides of the gap in your head at the same time and see precisely where they diverge. When I watched "wrong" attend to "corpus" at 93.7% and felt the pull of saying the model had found something, and then immediately traced that feeling back to matrix multiplication and a random seed, I was experiencing both sides of the gap in the same moment. Not as an abstract point about AI anthropomorphisation but as something I had just watched happen in my own code.

The governance implication is that I can now write about this with more precision. Not more confidence — I do not think the building gave me certainty about anything I was uncertain about before — but more precision about where exactly the appearance and the mechanism come apart, which is a different kind of value.

---

## What it means that the corpus shapes the weights

I chose the sentence "the corpus was wrong" because I had written an essay arguing that the training data for most large language models encodes systematic biases about whose language, whose knowledge, and whose experience is centred as normal. That argument did not change when I built the implementation. But building the implementation made the causal chain more concrete.

The weight matrices in a real transformer are not random. They are the product of gradient descent across billions of examples from a training corpus, adjusted iteration by iteration to minimise the difference between the model's predictions and the actual next token in the training data. What the model learns to attend to — which query vectors end up similar to which key vectors in this high-dimensional space — is determined by the patterns in that corpus. If the corpus over-represents certain registers of language, certain domains of knowledge, certain ways of framing the world, the geometry of the learned vector space reflects that, and the attention mechanism amplifies it, because dot products between vectors that have been trained on similar material will come out high.

This is not a new observation. But having built the mechanism that makes it true gives me a different relationship to the sentence when I write it. I can see the weight matrices. I can see the dot products. I can see how the geometry of learned embeddings is the corpus made mathematical, and how the attention mechanism is then a machine for navigating that geometry.

---

## On what "understanding" the mechanism actually gives you

I said at the start that I cannot claim this produced new policy insights, and I want to sit with that for a moment rather than moving past it. There is a version of this project I could have written where the conclusion is "and now I understand attention so I know what the right governance interventions are", and that version would be dishonest. The mechanism is one layer of a system with many layers. Understanding the attention operation does not automatically give you clarity about training data governance, or deployment decisions, or liability frameworks, or any of the regulatory questions that actually need answering.

What it does give you is the ability to reason about that mechanism rather than around it, which is a precondition for asking better questions. I can now ask, for instance: what would it look like for the attention scores to be auditable? What information would you need to retain from the forward pass to make that possible? Those are not questions I could have framed precisely before, because I did not have a precise enough picture of what a forward pass is. Building the implementation did not answer those questions, but it made them askable in a more useful way.

---

## The thing I keep coming back to

I am a sole parent and I do most of my learning in compressed windows of time between other things, which means the projects I take on need to justify themselves not just as things worth knowing but as things worth the specific cost of the time and attention they require. This one justified itself in a way I did not fully anticipate, which was by changing how I occupy the room when the conversation is technical.

AI governance involves a lot of conversations between people with different kinds of expertise, and the dynamics of those conversations are shaped in part by who feels entitled to make claims about the mechanism and who defers. Building this did not make me a machine learning engineer. But it moved me from the deferring side of that dynamic to a different position, one where I have reasons for my claims about the mechanism rather than just confidence in my analysis of its effects. That is a different kind of standing, and it is the kind of standing that I think governance work actually needs — not engineers doing governance, not non-technical people making policy about systems they have chosen not to understand, but people who have gone inside the thing and come back with something to say about it.

That is what this project was. And the documentation you are reading is the coming back.

---

→ [Back to the tiling pass](tiling.md) · [Back to README](README.MD)
