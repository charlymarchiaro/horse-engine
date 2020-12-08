#!/usr/bin/env python
# -*- coding: utf-8 -*-

import string
import sys
import gensim
from typing import List


class DocComparator(object):
    def __init__(
        self, shingle_length: int, max_num_shingles: int, overlap_threshold: float,
    ):
        self.shingle_length = shingle_length
        self.max_num_shingles = max_num_shingles
        self.overlap_threshold = overlap_threshold

    def compare_docs(self, doc1: str, doc2: str) -> bool:
        shingles1 = self.extract_shingle_list(doc1)
        shingles2 = self.extract_shingle_list(doc2)
        overlap = self.jaccard(shingles1, shingles2)
        return overlap > self.overlap_threshold

    def extract_shingle_list(self, doc: str) -> List[str]:
        shingles_set = set()

        tokens = gensim.utils.simple_preprocess(doc)
        for i in range(0, len(tokens) - self.shingle_length + 1):
            shingles_set.add(" ".join(tokens[i : i + self.shingle_length]))

        return sorted(shingles_set)

    # Jaccard Similarity function
    def jaccard(self, list1, list2):
        intersection = len(list(set(list1).intersection(list2)))
        union = (len(list1) + len(list2)) - intersection
        return float(intersection) / union
