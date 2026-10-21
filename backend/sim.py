"""
Discrete-event simulator for DP-FCFS research report.
Implements: FCFS-Static, FCFS-JSQ, SJF (oracle), DP-FCFS, DP-FCFS+ (novel extensions).
All VMs non-preemptive, FIFO queue per VM (except SJF = global queue).
"""
import math, random
from dataclasses import dataclass, field

@dataclass
class Task:
    tid: int
    name: str
    arrival: float
    burst: float           # actual burst (hidden from scheduler)
    pred: float            # formula-predicted burst
    prio: int = 3
    vm: int = -1
    start: float = 0.0
    finish: float = 0.0
    @property
    def wait(self): return self.start - self.arrival
    @property
    def tat(self): return self.finish - self.arrival


def predict_formula(D, C, I, P):
    """Report Section 4.2 formula, clamped to [0.5, 120]."""
    b = 0.012 * D + 0.006 * C + 0.0015 * I + (6 - P) * 0.2
    return min(120.0, max(0.5, b))


# ---------------------------------------------------------------- metrics
def jain(xs):
    xs = [max(x, 1e-9) for x in xs]
    s = sum(xs)
    return (s * s) / (len(xs) * sum(x * x for x in xs))

def metrics(tasks, M, busy=None):
    n = len(tasks)
    makespan = max(t.finish for t in tasks) - min(t.arrival for t in tasks)
    busy_t = sum(t.burst for t in tasks)
    return dict(
        ATT=sum(t.tat for t in tasks) / n,
        AWT=sum(t.wait for t in tasks) / n,
        MaxWait=max(t.wait for t in tasks),
        JFI=jain([t.wait + 1.0 for t in tasks]),   # +1s offset avoids 0-wait degeneracy
        UTIL=100 * busy_t / (M * makespan),
        MAKESPAN=makespan,
        THR=60 * n / makespan,
    )

def clone(tasks):
    return [Task(t.tid, t.name, t.arrival, t.burst, t.pred, t.prio) for t in tasks]


# ---------------------------------------------------------------- baselines
def run_fcfs_static(tasks, M):
    ts = sorted(clone(tasks), key=lambda t: (t.arrival, t.tid))
    avail = [0.0] * M
    for i, t in enumerate(ts):
        j = i % M
        t.vm = j; t.start = max(t.arrival, avail[j]); t.finish = t.start + t.burst
        avail[j] = t.finish
    return ts

def run_fcfs_jsq(tasks, M):
    """Join-shortest-queue by task COUNT (non-predictive reactive baseline)."""
    ts = sorted(clone(tasks), key=lambda t: (t.arrival, t.tid))
    avail = [0.0] * M
    assigned = [[] for _ in range(M)]
    for t in ts:
        qlen = [sum(1 for u in assigned[j] if u.finish > t.arrival) for j in range(M)]
        j = min(range(M), key=lambda k: (qlen[k], avail[k], k))
        t.vm = j; t.start = max(t.arrival, avail[j]); t.finish = t.start + t.burst
        avail[j] = t.finish; assigned[j].append(t)
    return ts

def run_sjf(tasks, M):
    """Non-preemptive SJF with oracle burst knowledge, global queue."""
    ts = sorted(clone(tasks), key=lambda t: (t.arrival, t.tid))
    avail = [0.0] * M
    pending = list(ts); done = []
    while pending:
        j = min(range(M), key=lambda k: (avail[k], k))
        now = max(avail[j], min(t.arrival for t in pending))
        ready = [t for t in pending if t.arrival <= now]
        t = min(ready, key=lambda u: (u.burst, u.arrival, u.tid))
        pending.remove(t)
        t.vm = j; t.start = now; t.finish = now + t.burst
        avail[j] = t.finish; done.append(t)
    return sorted(done, key=lambda t: t.tid)


# ---------------------------------------------------------------- DP-FCFS
def run_dpfcfs(tasks, M, speeds=None, calibrate=False, overrun_aware=False,
               lam=0.2, heavy_thr=15.0, reserve_light=0, guard_wait=40.0):
    """
    Dynamic Predictive FCFS. Tasks are handled strictly in arrival order. For each
    arrival the scheduler builds a PREDICTED backlog for every VM using only
    information observable at time t (completed / running / queued tasks and their
    predicted bursts) and selects VM* = argmin_j [ max(a_i, predAvail_j) + b_i/s_j ].

    calibrate     : Novelty N1 - Self-calibrating predictor (online EWMA residual
                    correction, one correction factor per size-class).
    overrun_aware : Novelty N2 - Overrun-aware backlog estimation (a running task that
                    has exceeded its prediction is assumed to need extra time instead
                    of "finishing now").
    """
    speeds = speeds or [1.0] * M
    ts = sorted(clone(tasks), key=lambda t: (t.arrival, t.tid))
    avail = [0.0] * M
    assigned = [[] for _ in range(M)]
    rho = {0: 1.0, 1: 1.0}                  # correction factor per class (light/heavy)
    fed = set()                             # tasks already used as feedback

    def cls(p): return 1 if p >= heavy_thr else 0
    def corr(t): return (rho[cls(t.pred)] if calibrate else 1.0) * t.pred

    for t in ts:
        now = t.arrival
        if calibrate:                       # feedback from tasks that completed by 'now'
            done = [u for j in range(M) for u in assigned[j]
                    if u.finish <= now and u.tid not in fed]
            for u in sorted(done, key=lambda u: u.finish):
                c = cls(u.pred)
                rho[c] = (1 - lam) * rho[c] + lam * (u.burst / u.pred)
                fed.add(u.tid)
        best_j, best_f = 0, float("inf")
        # predicted wait of the best non-shielded VM (used by the starvation guard)
        is_heavy = corr(t) >= heavy_thr
        cand = {}
        for j in range(M):
            pa = now
            for u in assigned[j]:
                if u.finish <= now:
                    continue
                if u.start <= now:          # running
                    elapsed = now - u.start
                    est = corr(u) / speeds[j]
                    if elapsed < est:
                        rem = est - elapsed
                    else:
                        rem = 0.3 * elapsed if overrun_aware else 0.0
                    pa += rem
                else:                       # queued
                    pa += corr(u) / speeds[j]
            cand[j] = pa + corr(t) / speeds[j]
        allowed = list(range(M))
        if reserve_light and is_heavy:      # Novelty N3: convoy-shield lane (VMs 0..k-1 light-only)
            open_vms = [j for j in range(M) if j >= reserve_light]
            wait_open = min(cand[j] for j in open_vms) - corr(t) - now
            if wait_open <= guard_wait:     # starvation guard: lift the shield if heavy wait too long
                allowed = open_vms
        best_j = min(allowed, key=lambda j: (cand[j], j))
        j = best_j
        t.vm = j; t.start = max(t.arrival, avail[j])
        t.finish = t.start + t.burst / speeds[j]
        avail[j] = t.finish; assigned[j].append(t)
    return sorted(ts, key=lambda t: t.tid)


# ---------------------------------------------------------------- workloads
def ecommerce_workload():
    """Reconstruction of the convoy-critical E-Commerce Flash Sale workload:
    one 65 s inventory sync at t=0 followed by 11 checkout/payment tasks (1-5 s)."""
    rnd = random.Random(7)
    names = ["Inventory Sync", "Checkout-A", "Payment-1", "Cart-Update", "Checkout-B",
             "Payment-2", "Coupon-Verify", "Checkout-C", "Payment-3", "Order-Confirm",
             "Checkout-D", "Payment-4"]
    ts = [Task(0, names[0], 0.0, 65.0, 65.0 * 1.0, 2)]
    arr = 0.5
    for i in range(1, 12):
        b = round(rnd.uniform(1.0, 5.0), 1)
        ts.append(Task(i, names[i], round(arr, 1), b, round(b * rnd.uniform(0.92, 1.08), 2), 4))
        arr += rnd.uniform(0.1, 0.4)
    return ts

def fintech_workload():
    rnd = random.Random(11)
    ts = []; arr = 0.0
    spec = [("HFT-Trade", 0.5), ("HFT-Trade", 0.7), ("MonteCarlo-VaR", 68.0), ("HFT-Trade", 0.9),
            ("Risk-Report", 44.0), ("HFT-Trade", 0.6), ("HFT-Trade", 0.8)]
    for i, (n, b) in enumerate(spec):
        ts.append(Task(i, f"{n}-{i}", round(arr, 1), b, round(b * rnd.uniform(0.94, 1.06), 2), 3))
        arr += rnd.uniform(0.1, 0.4)
    return ts

def aiml_workload():
    rnd = random.Random(5)
    spec = [("PyTorch-FineTune", 72.0), ("LLM-Infer-1", 3.4), ("Safety-Classify", 1.8),
            ("LLM-Infer-2", 3.9), ("Embed-Batch", 6.2), ("LLM-Infer-3", 2.7)]
    ts = []; arr = 0.0
    for i, (n, b) in enumerate(spec):
        ts.append(Task(i, n, round(arr, 1), b, round(b * rnd.uniform(0.95, 1.05), 2), 3))
        arr += rnd.uniform(0.1, 0.4)
    return ts

def synthetic_workload(seed, n=200, M=3, util=0.75, noise=0.10, drift_heavy=1.0,
                       heavy_frac=0.15):
    """Bimodal workload (85% light 0.5-5 s, 15% heavy 30-70 s) with Poisson arrivals.
    noise      : lognormal sigma of formula prediction error
    drift_heavy: actual/forecast multiplier for heavy tasks (concept drift)."""
    rnd = random.Random(seed)
    mean_b = (1 - heavy_frac) * 2.75 + heavy_frac * 50.0
    rate = util * M / mean_b
    t = 0.0; ts = []
    for i in range(n):
        t += rnd.expovariate(rate)
        heavy = rnd.random() < heavy_frac
        base = rnd.uniform(30, 70) if heavy else rnd.uniform(0.5, 5.0)
        pred = max(0.5, base * math.exp(rnd.gauss(0, noise)))
        actual = base * (drift_heavy if heavy else 1.0) * math.exp(rnd.gauss(0, noise / 2))
        ts.append(Task(i, f"T{i}", round(t, 3), round(actual, 3), round(pred, 3)))
    return ts
