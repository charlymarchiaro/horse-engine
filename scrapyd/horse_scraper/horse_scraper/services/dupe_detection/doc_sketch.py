#!/usr/bin/env python
# -*- coding: utf-8 -*-

import string
import sys
import gensim
from typing import List


guid = lambda x: ord(x)


class DocSketchGenerator(object):
    """
    Based on: 
    
    [1] https://github.com/kailashbuki/fingerprint by kailash.buki@gmail.com (Kailash Budhathoki)
    [2] Rodier, Simon and Carter, Dave. (2020). Online Near-Duplicate Detection of News Articles. 
        Proceedings of the 12th Language Resources and Evaluation Conference. 1242-1249. 
        2020.lrec-1.156. https://www.aclweb.org/anthology/2020.lrec-1.156.pdf

    Attributes:
        base (Optional[int]): base required for computing the rolling hash function. Defaults to 101.
        modulo (Optional[int]): hash values cannot exceed this value. Defaults to sys.maxint.
    """

    def __init__(
        self,
        base: int,
        modulo: int,
        permutations: List[int],
        shingle_length: int,
        max_num_shingles: int,
    ):
        self.base = base
        self.modulo = modulo
        self.permutations = permutations
        self.shingle_length = shingle_length
        self.max_num_shingles = max_num_shingles

    def generate_sketch(self, doc: str) -> List[int]:
        shingles = self.extract_shingle_list(doc)
        if len(shingles) == 0:
            return []

        print(doc)

        fingerprints = [self.get_fingerprint(sh) for sh in shingles]
        min_hashes = [self.get_min_hash(fingerprints, p) for p in self.permutations]

        offset = 2 ** 63
        print([h - offset for h in min_hashes])
        print("")
        print("")

        return min_hashes

    def extract_shingle_list(self, doc: str) -> List[str]:
        shingles_set = set()

        # doc = self.sanitize(doc)
        tokens = gensim.utils.simple_preprocess(doc)
        for i in range(0, len(tokens) - self.shingle_length + 1):
            shingles_set.add(" ".join(tokens[i : i + self.shingle_length]))

        return sorted(shingles_set)

    def get_fingerprint(self, str: str) -> int:
        hash = 0
        for i, c in enumerate(str):
            hash += guid(c) * self.base ** (len(str) - 1 - i)
        hash = hash % self.modulo
        return hash

    def get_min_hash(self, fingerprints: List[int], permutation: int):
        # Bitwise XOR
        list = [f ^ permutation for f in fingerprints]
        return min(list)

    def sanitize(self, str: str) -> str:
        sanitized = ""
        exclude = string.punctuation
        for c in str:
            if c not in exclude and c not in ("\n", "\r", " "):
                sanitized += c
        return sanitized
