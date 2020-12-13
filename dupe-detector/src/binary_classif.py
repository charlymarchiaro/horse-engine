from enum import Enum
from typing import Dict, List, Tuple

from .utils import *


def f1_score(v1: float, v2: float) -> float:
    return 2 * v1 * v2 / (v1 + v2) if v1 * v2 != 0 else 0


class BinaryClassifCateg(Enum):
    TP = "TP"
    FP = "FP"
    FN = "FN"
    TN = "TN"


class BinaryClassifStats(object):
    result_counts: Dict[BinaryClassifCateg, int]
    num_results: int

    def __init__(self, name: str) -> None:
        self.name = name
        self.result_counts = {
            BinaryClassifCateg.TP: 0,
            BinaryClassifCateg.FP: 0,
            BinaryClassifCateg.FN: 0,
            BinaryClassifCateg.TN: 0,
        }
        self.num_results = 0

    def add_result(self, test_outcome: bool, condition: bool):
        categ = self.binary_classif_categ(test_outcome, condition)
        self.result_counts[categ] += 1
        self.num_results += 1

    def get_stats(self):
        tp = self.result_counts[BinaryClassifCateg.TP]
        fp = self.result_counts[BinaryClassifCateg.FP]
        fn = self.result_counts[BinaryClassifCateg.FN]
        tn = self.result_counts[BinaryClassifCateg.TN]
        precision = tp / (tp + fp) if tp != 0 else 0
        recall = tp / (tp + fn) if tp != 0 else 0
        f1 = f1_score(precision, recall)

        return {
            "tp": tp,
            "fp": fp,
            "fn": fn,
            "tn": tn,
            "precision": precision,
            "recall": recall,
            "f1": f1,
        }

    def print_stats(self):
        stats = self.get_stats()

        tp = stats["tp"]
        fp = stats["fp"]
        fn = stats["fn"]
        tn = stats["tn"]
        precision = stats["precision"]
        recall = stats["recall"]
        f1 = stats["f1"]

        tp_str = "{:.1f}".format(100 * tp / self.num_results) + "%"
        fp_str = "{:.1f}".format(100 * fp / self.num_results) + "%"
        fn_str = "{:.1f}".format(100 * fn / self.num_results) + "%"
        tn_str = "{:.1f}".format(100 * tn / self.num_results) + "%"
        precision_str = "{:.1f}".format(100 * precision) + "%"
        recall_str = "{:.1f}".format(100 * recall) + "%"
        recall_str = "{:.1f}".format(100 * recall) + "%"
        f1_str = "{:.1f}".format(100 * f1) + "%"

        print_subtitle_1(f"{self.name}: Binary classif results")
        print(f"True positive: {tp_str}    True negative: {tn_str}")
        print(f"False positive: {fp_str}    False negative: {fn_str}")
        print(f">> Precision: {precision_str},    Recall: {recall_str}")
        print(f">> F1 score: {f1_str}")

    def binary_classif_categ(
        self, test_outcome: bool, condition: bool
    ) -> BinaryClassifCateg:
        if test_outcome == True and condition == True:
            return BinaryClassifCateg.TP
        if test_outcome == True and condition == False:
            return BinaryClassifCateg.FP
        if test_outcome == False and condition == True:
            return BinaryClassifCateg.FN
        if test_outcome == False and condition == False:
            return BinaryClassifCateg.TN
        raise Exception("Binary classif error.")
