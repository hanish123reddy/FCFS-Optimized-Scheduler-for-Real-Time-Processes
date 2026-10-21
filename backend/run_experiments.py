import json, math, statistics as st
from sim import *

M = 3
ALGS = {
 "FCFS-Static": run_fcfs_static,
 "FCFS-JSQ":    run_fcfs_jsq,
 "SJF (oracle)":run_sjf,
 "DP-FCFS":     run_dpfcfs,
 "DP-FCFS+Shield": lambda w, M: run_dpfcfs(w, M, reserve_light=1, guard_wait=1e9),
}
out = {}

# E1-E3 : reconstructed convoy workloads
out["named"] = {}
for nm, wl in [("E-Commerce Flash Sale", ecommerce_workload()),
               ("FinTech HFT + Risk", fintech_workload()),
               ("AI/ML Pipeline", aiml_workload())]:
    out["named"][nm] = {a: metrics(f(wl, M), M) for a, f in ALGS.items()}

# E4 : synthetic 200-task, 40 seeds, util 0.75
SEEDS = range(40)
def agg(f, **kw):
    r = [metrics(f(synthetic_workload(s, **kw), M), M) for s in SEEDS]
    res = {}
    for k in ["ATT", "AWT", "MaxWait", "JFI", "UTIL", "THR"]:
        xs = [x[k] for x in r]; sd = st.stdev(xs)
        res[k] = (st.mean(xs), 1.96 * sd / math.sqrt(len(xs)))
    return res
out["synthetic"] = {a: agg(f, util=0.75) for a, f in ALGS.items()}

# E5 : utilisation sweep (mean AWT, MaxWait)
utils = [0.5, 0.6, 0.7, 0.8, 0.9]
out["util_sweep"] = {"utils": utils}
for a, f in ALGS.items():
    out["util_sweep"][a] = {"AWT": [], "MaxWait": []}
    for u in utils:
        r = agg(f, util=u)
        out["util_sweep"][a]["AWT"].append(r["AWT"][0]); out["util_sweep"][a]["MaxWait"].append(r["MaxWait"][0])

# E6 : shield guard frontier (util 0.75)
out["frontier"] = []
for g in [0, 20, 40, 80, 160, 1e9]:
    f = (lambda w, M, g=g: run_dpfcfs(w, M, reserve_light=1, guard_wait=g))
    r = agg(f, util=0.75)
    out["frontier"].append({"guard": g, "AWT": r["AWT"][0], "MaxWait": r["MaxWait"][0], "JFI": r["JFI"][0]})

# E7 : prediction-noise robustness (util 0.75) for DP-FCFS vs JSQ
out["noise"] = {"sigmas": [0.0, 0.1, 0.2, 0.4, 0.8]}
for a in ["FCFS-JSQ", "DP-FCFS"]:
    out["noise"][a] = [agg(ALGS[a], util=0.75, noise=s)["AWT"][0] for s in out["noise"]["sigmas"]]

# E8 : N1 self-calibration under concept drift (util 0.6)
out["drift"] = {}
for label, d in [("none (x1.0)", 1.0), ("heavy +25% (x1.25)", 1.25), ("heavy +50% (x1.5)", 1.5)]:
    row = {}
    for nm, f in [("DP-FCFS", run_dpfcfs),
                  ("DP-FCFS + N1 calibration", lambda w, M: run_dpfcfs(w, M, calibrate=True)),
                  ("DP-FCFS + N1 + N2", lambda w, M: run_dpfcfs(w, M, calibrate=True, overrun_aware=True))]:
        r = agg(f, util=0.6, drift_heavy=d)
        row[nm] = {"AWT": r["AWT"][0], "ATT": r["ATT"][0]}
    out["drift"][label] = row

json.dump(out, open("results.json", "w"), indent=1, default=float)
print("Saved results.json")
print("E1-E3 Named Workloads:")
print(json.dumps(out["named"], indent=1)[:600])
