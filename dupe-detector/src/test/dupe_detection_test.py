from typing import List

import json
import os
import random
import statistics

from ..utils import *
from ..doc_sketch import DocSketchGenerator
from ..doc_comparator import DocComparator
from ..binary_classif import *

# Configure PrettyPrinter
import pprint

pp = pprint.PrettyPrinter(indent=4, sort_dicts=False)


# Current file path
dir_path = os.path.dirname(os.path.realpath(__file__))

# Load data
with open(dir_path + "/comparison_docs.json", encoding="utf-8") as input_file:
    docs_data = json.load(input_file)

with open(dir_path + "/comparison_params.json", encoding="utf-8") as input_file:
    params_data = json.load(input_file)

num_permutations_list: List[int] = params_data["num_permutations"]
base_list: List[int] = params_data["base"]
hash_bits_list: List[int] = params_data["hash_bits"]
shingle_length_list: List[int] = params_data["shingle_length"]
max_num_shingles_list: List[int] = params_data["max_num_shingles"]
hash_collision_thresh_list: List[float] = params_data["hash_collision_thresh"]
overlap_thresh_list: List[float] = params_data["overlap_thresh"]


def run_test_for_params(params):
    num_permutations = params["num_permutations"]
    base = params["base"]
    hash_bits = params["hash_bits"]
    shingle_length = params["shingle_length"]
    max_num_shingles = params["max_num_shingles"]
    hash_collision_thresh = params["hash_collision_thresh"]
    overlap_thresh = params["overlap_thresh"]

    modulo = 2 ** hash_bits

    permutations = [random.randint(0, modulo - 1) for i in range(num_permutations)]

    dupeCandidateStats = BinaryClassifStats("Duplicate candidate")
    docComparisonStats = BinaryClassifStats("Doc comparison")

    sketchGenerator = DocSketchGenerator(
        base, modulo, permutations, shingle_length, max_num_shingles
    )
    docComparator = DocComparator(shingle_length, max_num_shingles, overlap_thresh)

    max_hash_range_utiliz_coef = 0

    print_subtitle_1("Modulo")
    print(modulo)

    print_subtitle_1("Permutations")
    pp.pprint(permutations)

    print_subtitle_1("Comparing documents")

    # Iterate through all the comparisons
    for i, comparison in enumerate(docs_data):
        doc1 = comparison["doc1"]
        doc2 = comparison["doc2"]
        are_duplicates = comparison["are_duplicates"]

        sketch1 = sketchGenerator.generate_sketch(doc1)
        sketch2 = sketchGenerator.generate_sketch(doc2)
        hash_collisions = list(set(sketch1).intersection(sketch2))
        are_dupe_candidates = (
            len(hash_collisions) / num_permutations > hash_collision_thresh
        )

        similarity = (
            docComparator.docs_similarity(doc1, doc2) if are_dupe_candidates else 0
        )
        comparison_result = similarity > overlap_thresh

        dupeCandidateStats.add_result(are_dupe_candidates, are_duplicates)
        docComparisonStats.add_result(comparison_result, are_duplicates)

        # Hash range utilization coefficient
        hashes_list = sketch1 + sketch2
        hash_range_utiliz_coef = 6 * statistics.stdev(hashes_list) / modulo
        if hash_range_utiliz_coef > max_hash_range_utiliz_coef:
            max_hash_range_utiliz_coef = hash_range_utiliz_coef

        # Print results
        sketch1_str = str(
            [("(*)" if h in hash_collisions else "") + str(h) for h in sketch1]
        )
        sketch2_str = str(
            [("(*)" if h in hash_collisions else "") + str(h) for h in sketch2]
        )
        similarity_str = "{:.3f}".format(similarity)

        print(f">> sketch1: {sketch1_str}")
        print(f">> sketch2: {sketch2_str}")
        print(
            f">> Hash collisions: {len(hash_collisions)}/{num_permutations} --> Duplicate candidates: {str(are_dupe_candidates)}"
        )
        print(
            f">> Comparison: similarity={similarity_str}, result={str(comparison_result)}"
        )
        candidate_test_result_str = (
            "SUCCESS" if are_dupe_candidates == are_duplicates else "FAIL"
        )
        comparison_test_result_str = (
            "SUCCESS" if comparison_result == are_duplicates else "FAIL"
        )
        print(
            f">> Duplicate candidate test: << {candidate_test_result_str} >>, Doc comparison test: << {comparison_test_result_str} >>"
        )
        print()

    print_subtitle_1("Test results")

    dupeCandidateStats.print_stats()
    docComparisonStats.print_stats()

    dupe_candidate_stats = dupeCandidateStats.get_stats()
    doc_comparison_stats = docComparisonStats.get_stats()

    dupe_candidate_score = dupe_candidate_stats["f1"]
    doc_comparison_score = doc_comparison_stats["f1"]
    overall_score = f1_score(dupe_candidate_score, doc_comparison_score)
    overall_score_str = "{:.1f}".format(overall_score * 100) + "%"

    print()
    max_hash_range_utiliz_coef_str = (
        "{:.1f}".format(100 * max_hash_range_utiliz_coef) + "%"
    )
    print(
        f">> Max hash range utilization coefficient: {max_hash_range_utiliz_coef_str}"
    )
    print(f">> OVERALL SCORE: {overall_score_str}")
    print()

    return {
        "params": params,
        "permutations": permutations,
        "overall_score": overall_score,
        "dupe_candidate_stats": dupe_candidate_stats,
        "doc_comparison_stats": doc_comparison_stats,
        "max_hash_range_utiliz_coef": max_hash_range_utiliz_coef,
    }


def run_test():
    for i, comparison in enumerate(docs_data):
        print_title_1(f"Analizing comparison #{i}:")
        print_subtitle_1("Doc 1")
        print(">> " + comparison["doc1"])
        print()
        print_subtitle_1("Doc 2")
        print(">> " + comparison["doc2"])
        print()
        print_subtitle_1("Are duplicates")
        print(">> " + str(comparison["are_duplicates"]))

    best_params_tests = {"score": 0, "tests": []}
    all_tests = []

    params_set = 0
    for num_permutations in num_permutations_list:
        for base in base_list:
            for hash_bits in hash_bits_list:
                for shingle_length in shingle_length_list:
                    for max_num_shingles in max_num_shingles_list:
                        for hash_collision_thresh in hash_collision_thresh_list:
                            for overlap_thresh in overlap_thresh_list:

                                params_set += 1

                                params = {
                                    "num_permutations": num_permutations,
                                    "base": base,
                                    "hash_bits": hash_bits,
                                    "shingle_length": shingle_length,
                                    "max_num_shingles": max_num_shingles,
                                    "hash_collision_thresh": hash_collision_thresh,
                                    "overlap_thresh": overlap_thresh,
                                }
                                print_title_1(f"PARAMS SET #{params_set}")
                                pp.pprint(params)

                                # Run the test
                                test_results = run_test_for_params(params)

                                test_score = test_results["overall_score"]

                                if test_score > best_params_tests["score"]:
                                    best_params_tests["tests"] = [test_results]
                                    best_params_tests["score"] = test_score
                                elif test_score == best_params_tests["score"]:
                                    best_params_tests["tests"].append(test_results)

                                all_tests.append(test_results)

    print_title_1("FINAL RESULTS")
    pp.pprint(best_params_tests)
    print_subtitle_1("All tests results")
    pp.pprint(all_tests)


run_test()
