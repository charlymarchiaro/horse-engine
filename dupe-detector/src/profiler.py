import time
import logging
from typing import Dict, List


class Profiler(object):
    last_time: float
    last_label: str
    stats_data: Dict[str, List[float]]

    def __init__(self):
        self.last_time = 0
        self.last_label = "*"
        self.stats_data = {}

    def reg_time(self, label: str):
        current_time = time.time()

        delta_time_sec = current_time - (self.last_time or current_time)
        interval_name = f"{self.last_label}-{label}"

        if interval_name in self.stats_data:
            self.stats_data[interval_name].append(delta_time_sec)
        else:
            self.stats_data[interval_name] = [delta_time_sec]

        self.last_time = current_time
        self.last_label = label

    def log_stats(self):
        logging.debug(
            "---------------------------------------------------------------------------------------------------------------"
        )
        logging.debug(">> [Profiler stats]")
        for interval_name in sorted(self.stats_data):
            values = self.stats_data[interval_name]
            total = "{:.2f}".format(sum(values))
            avg = "{:.2f}".format(sum(values) / len(values))
            logging.debug(f">> {interval_name.rjust(20)}: avg={avg}s, sum={total}s")

        logging.debug(
            "---------------------------------------------------------------------------------------------------------------"
        )
        # Reset stats data
        self.stats_data = {}
