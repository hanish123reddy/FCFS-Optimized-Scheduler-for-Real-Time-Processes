"""
Discrete-Event Cloud Task Scheduler Engine for DP-FCFS.
Implements:
1. Standard FCFS Scheduling
2. Non-Preemptive SJF (Shortest Job First) Scheduling
3. DP-FCFS (Dynamic Predictive FCFS) Scheduling
Calculates core OS metrics: ATT (Turnaround), AWT (Waiting), ART (Response), CPU Utilization, Throughput.
"""
import copy

class Task:
    def __init__(self, task_id, name, arrival_time, actual_burst_time, predicted_burst_time=None,
                 data_size_mb=100, cpu_cycles_m=500, io_ops=1000, priority=3):
        self.id = str(task_id)
        self.name = str(name)
        self.arrival_time = float(arrival_time)
        self.actual_burst_time = float(actual_burst_time)
        self.predicted_burst_time = float(predicted_burst_time if predicted_burst_time is not None else actual_burst_time)
        self.data_size_mb = float(data_size_mb)
        self.cpu_cycles_m = float(cpu_cycles_m)
        self.io_ops = float(io_ops)
        self.priority = int(priority)

        # Simulation output parameters
        self.start_time = None
        self.finish_time = None
        self.first_execution_time = None
        self.waiting_time = None
        self.turnaround_time = None
        self.response_time = None
        self.vm_id = None

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "arrival_time": round(self.arrival_time, 2),
            "actual_burst_time": round(self.actual_burst_time, 2),
            "predicted_burst_time": round(self.predicted_burst_time, 2),
            "start_time": round(self.start_time, 2) if self.start_time is not None else None,
            "finish_time": round(self.finish_time, 2) if self.finish_time is not None else None,
            "waiting_time": round(self.waiting_time, 2) if self.waiting_time is not None else None,
            "turnaround_time": round(self.turnaround_time, 2) if self.turnaround_time is not None else None,
            "response_time": round(self.response_time, 2) if self.response_time is not None else None,
            "vm_id": self.vm_id
        }


class VirtualMachine:
    def __init__(self, vm_id, name="VM Node", cpus=4, ram_gb=16, speed_factor=1.0):
        self.id = str(vm_id)
        self.name = str(name)
        self.cpus = int(cpus)
        self.ram_gb = int(ram_gb)
        self.speed_factor = float(speed_factor)
        self.available_at = 0.0
        self.busy_time = 0.0

    def reset(self):
        self.available_at = 0.0
        self.busy_time = 0.0


class CloudSchedulerEngine:
    """Simulates CPU / Cloud Task Scheduling algorithms."""

    def __init__(self, num_vms=3):
        self.vms = [
            VirtualMachine(f"VM-{i+1}", f"VM Core Node {i+1}", cpus=4, ram_gb=16)
            for i in range(num_vms)
        ]

    def _clone_tasks(self, raw_tasks):
        """Creates deep copies of tasks sorted by arrival time with automatic ML burst prediction."""
        from predictor import predictor
        cloned = []
        for t in raw_tasks:
            d_size = float(t.get('data_size_mb', 100))
            c_cycles = float(t.get('cpu_cycles_m', 500))
            io = float(t.get('io_ops', 1000))
            prio = int(t.get('priority', 3))
            
            actual_b = float(t.get('actual_burst_time', t.get('burst_time', 0.0)))
            if actual_b <= 0:
                actual_b = predictor.predict_burst_time(d_size, c_cycles, io, prio)

            pred_b = t.get('predicted_burst_time')
            if pred_b is None:
                pred_b = predictor.predict_burst_time(d_size, c_cycles, io, prio)
            else:
                pred_b = float(pred_b)

            t_obj = Task(
                task_id=t.get('id', '1'),
                name=t.get('name', 'Task'),
                arrival_time=float(t.get('arrival_time', 0.0)),
                actual_burst_time=actual_b,
                predicted_burst_time=pred_b,
                data_size_mb=d_size,
                cpu_cycles_m=c_cycles,
                io_ops=io,
                priority=prio
            )
            cloned.append(t_obj)
        cloned.sort(key=lambda x: x.arrival_time)
        return cloned

    def _clone_vms(self, num_vms):
        vms = [
            VirtualMachine(f"VM-{i+1}", f"Cloud Server Node {i+1}")
            for i in range(num_vms)
        ]
        return vms

    def run_fcfs(self, raw_tasks, num_vms=3):
        """Standard First-Come, First-Served (FCFS) Non-Preemptive Scheduling."""
        tasks = self._clone_tasks(raw_tasks)
        vms = self._clone_vms(num_vms)
        
        timeline = []
        for task in tasks:
            # Pick VM that becomes available earliest
            best_vm = min(vms, key=lambda v: v.available_at)
            
            start = max(task.arrival_time, best_vm.available_at)
            exec_time = task.actual_burst_time / best_vm.speed_factor
            finish = start + exec_time

            task.start_time = start
            task.finish_time = finish
            task.first_execution_time = start
            task.waiting_time = start - task.arrival_time
            task.turnaround_time = finish - task.arrival_time
            task.response_time = start - task.arrival_time
            task.vm_id = best_vm.id

            best_vm.available_at = finish
            best_vm.busy_time += exec_time

            timeline.append({
                "task_id": task.id,
                "task_name": task.name,
                "vm_id": best_vm.id,
                "start_time": round(start, 2),
                "finish_time": round(finish, 2),
                "duration": round(exec_time, 2)
            })

        return self._build_result("Standard FCFS", tasks, vms, timeline)

    def run_sjf_non_preemptive(self, raw_tasks, num_vms=3):
        """Non-Preemptive Shortest Job First (SJF) Scheduling based on actual burst time."""
        tasks = self._clone_tasks(raw_tasks)
        vms = self._clone_vms(num_vms)

        unprocessed = copy.deepcopy(tasks)
        processed_tasks = []
        timeline = []
        current_time = 0.0

        while unprocessed:
            # Find tasks that have arrived by current_time (or minimum arrival among remaining)
            arrived = [t for t in unprocessed if t.arrival_time <= current_time]
            if not arrived:
                current_time = min(t.arrival_time for t in unprocessed)
                arrived = [t for t in unprocessed if t.arrival_time <= current_time]

            # Sort arrived tasks by actual burst time (Shortest Job First)
            arrived.sort(key=lambda x: (x.actual_burst_time, x.arrival_time))
            next_task = arrived[0]

            best_vm = min(vms, key=lambda v: v.available_at)
            start = max(next_task.arrival_time, best_vm.available_at)
            exec_time = next_task.actual_burst_time / best_vm.speed_factor
            finish = start + exec_time

            next_task.start_time = start
            next_task.finish_time = finish
            next_task.first_execution_time = start
            next_task.waiting_time = start - next_task.arrival_time
            next_task.turnaround_time = finish - next_task.arrival_time
            next_task.response_time = start - next_task.arrival_time
            next_task.vm_id = best_vm.id

            best_vm.available_at = finish
            best_vm.busy_time += exec_time

            timeline.append({
                "task_id": next_task.id,
                "task_name": next_task.name,
                "vm_id": best_vm.id,
                "start_time": round(start, 2),
                "finish_time": round(finish, 2),
                "duration": round(exec_time, 2)
            })

            processed_tasks.append(next_task)
            unprocessed = [t for t in unprocessed if t.id != next_task.id]
            current_time = min(v.available_at for v in vms)

        return self._build_result("Non-Preemptive SJF", processed_tasks, vms, timeline)

    def run_dp_fcfs(self, raw_tasks, num_vms=3):
        """
        Dynamic Predictive FCFS (DP-FCFS) Scheduling.
        Preserves arrival order priority while dynamically placing tasks on the optimal VM
        using Machine Learning predicted burst times to prevent convoy accumulation.
        """
        tasks = self._clone_tasks(raw_tasks)
        vms = self._clone_vms(num_vms)

        timeline = []
        for task in tasks:
            # DP-FCFS evaluation: Evaluates estimated completion time per VM using predicted burst
            best_vm = None
            min_predicted_finish = float('inf')

            for vm in vms:
                est_start = max(task.arrival_time, vm.available_at)
                est_finish = est_start + (task.predicted_burst_time / vm.speed_factor)
                if est_finish < min_predicted_finish:
                    min_predicted_finish = est_finish
                    best_vm = vm

            # Execute with actual burst time on chosen VM
            start = max(task.arrival_time, best_vm.available_at)
            exec_time = task.actual_burst_time / best_vm.speed_factor
            finish = start + exec_time

            task.start_time = start
            task.finish_time = finish
            task.first_execution_time = start
            task.waiting_time = start - task.arrival_time
            task.turnaround_time = finish - task.arrival_time
            task.response_time = start - task.arrival_time
            task.vm_id = best_vm.id

            best_vm.available_at = finish
            best_vm.busy_time += exec_time

            timeline.append({
                "task_id": task.id,
                "task_name": task.name,
                "vm_id": best_vm.id,
                "start_time": round(start, 2),
                "finish_time": round(finish, 2),
                "duration": round(exec_time, 2)
            })

        return self._build_result("Dynamic Predictive FCFS (DP-FCFS)", tasks, vms, timeline)

    def run_fcfs_jsq(self, raw_tasks, num_vms=3):
        """
        Join-Shortest-Queue (FCFS-JSQ) Reactive Baseline.
        Dispatches tasks to the VM with the smallest number of active/queued tasks at arrival.
        """
        tasks = self._clone_tasks(raw_tasks)
        vms = self._clone_vms(num_vms)
        assigned = [[] for _ in range(num_vms)]
        timeline = []

        for task in tasks:
            # Count queued/running tasks on each VM that haven't finished by arrival time
            qlen = [sum(1 for u in assigned[j] if u.finish_time > task.arrival_time) for j in range(num_vms)]
            best_idx = min(range(num_vms), key=lambda k: (qlen[k], vms[k].available_at, k))
            best_vm = vms[best_idx]

            start = max(task.arrival_time, best_vm.available_at)
            exec_time = task.actual_burst_time / best_vm.speed_factor
            finish = start + exec_time

            task.start_time = start
            task.finish_time = finish
            task.first_execution_time = start
            task.waiting_time = start - task.arrival_time
            task.turnaround_time = finish - task.arrival_time
            task.response_time = start - task.arrival_time
            task.vm_id = best_vm.id

            best_vm.available_at = finish
            best_vm.busy_time += exec_time
            assigned[best_idx].append(task)

            timeline.append({
                "task_id": task.id,
                "task_name": task.name,
                "vm_id": best_vm.id,
                "start_time": round(start, 2),
                "finish_time": round(finish, 2),
                "duration": round(exec_time, 2)
            })

        return self._build_result("FCFS-JSQ (Join Shortest Queue)", tasks, vms, timeline)

    def run_dp_fcfs_shield(self, raw_tasks, num_vms=3, reserve_light=1, guard_wait=40.0,
                           calibrate=True, overrun_aware=True, heavy_thr=15.0, lam=0.2):
        """
        Dynamic Predictive FCFS with Convoy Shield and Feedback Loop (DP-FCFS+Shield).
        Novelty N1: Self-calibrating EWMA predictor (residual feedback correction rho per size class).
        Novelty N2: Overrun-aware backlog estimation (tasks exceeding prediction assumed to need extra 0.3*elapsed).
        Novelty N3: Convoy-shield lane (VMs 0..reserve_light-1 light-only, with starvation guard_wait for heavy tasks).
        """
        tasks = self._clone_tasks(raw_tasks)
        vms = self._clone_vms(num_vms)
        assigned = [[] for _ in range(num_vms)]
        timeline = []
        rho = {0: 1.0, 1: 1.0}
        fed = set()

        def cls(p): return 1 if p >= heavy_thr else 0
        def corr(t): return (rho[cls(t.predicted_burst_time)] if calibrate else 1.0) * t.predicted_burst_time

        for task in tasks:
            now = task.arrival_time

            # N1: Calibration update on tasks completed by now
            if calibrate:
                done = [u for j in range(num_vms) for u in assigned[j]
                        if u.finish_time <= now and u.id not in fed]
                for u in sorted(done, key=lambda u: u.finish_time):
                    c = cls(u.predicted_burst_time)
                    if u.predicted_burst_time > 0:
                        rho[c] = (1 - lam) * rho[c] + lam * (u.actual_burst_time / u.predicted_burst_time)
                    fed.add(u.id)

            is_heavy = corr(task) >= heavy_thr
            cand = {}
            for j in range(num_vms):
                pa = now
                for u in assigned[j]:
                    if u.finish_time <= now:
                        continue
                    if u.start_time <= now:  # currently running
                        elapsed = now - u.start_time
                        est = corr(u) / vms[j].speed_factor
                        if elapsed < est:
                            rem = est - elapsed
                        else:
                            rem = 0.3 * elapsed if overrun_aware else 0.0  # N2
                        pa += rem
                    else:  # queued
                        pa += corr(u) / vms[j].speed_factor
                cand[j] = pa + corr(task) / vms[j].speed_factor

            allowed = list(range(num_vms))
            # N3: Convoy-shield lane (VMs 0..reserve_light-1 light-only)
            if reserve_light and is_heavy and num_vms > reserve_light:
                open_vms = [j for j in range(num_vms) if j >= reserve_light]
                wait_open = min(cand[j] for j in open_vms) - corr(task) - now
                if wait_open <= guard_wait:  # Starvation guard
                    allowed = open_vms

            best_idx = min(allowed, key=lambda j: (cand[j], j))
            best_vm = vms[best_idx]

            start = max(task.arrival_time, best_vm.available_at)
            exec_time = task.actual_burst_time / best_vm.speed_factor
            finish = start + exec_time

            task.start_time = start
            task.finish_time = finish
            task.first_execution_time = start
            task.waiting_time = start - task.arrival_time
            task.turnaround_time = finish - task.arrival_time
            task.response_time = start - task.arrival_time
            task.vm_id = best_vm.id

            best_vm.available_at = finish
            best_vm.busy_time += exec_time
            assigned[best_idx].append(task)

            timeline.append({
                "task_id": task.id,
                "task_name": task.name,
                "vm_id": best_vm.id,
                "start_time": round(start, 2),
                "finish_time": round(finish, 2),
                "duration": round(exec_time, 2)
            })

        return self._build_result("DP-FCFS + Convoy Shield (N1-N3)", tasks, vms, timeline)

    def run_round_robin(self, raw_tasks, num_vms=3, time_quantum=4.0):
        """
        Multi-VM Round Robin (RR) Scheduling with preemptive time slicing.
        Tasks are executed for at most `time_quantum` seconds before yielding back to the ready queue.
        """
        tasks = self._clone_tasks(raw_tasks)
        vms = self._clone_vms(num_vms)

        class RRTaskState:
            def __init__(self, task):
                self.task = task
                self.remaining_burst = task.actual_burst_time
                self.has_started = False

        task_states = {t.id: RRTaskState(t) for t in tasks}
        ready_queue = []
        unarrived = list(tasks)
        timeline = []
        current_time = 0.0

        completed_count = 0
        total_tasks = len(tasks)

        # Simulation loop
        while completed_count < total_tasks:
            # Check newly arrived tasks
            new_arrivals = [t for t in unarrived if t.arrival_time <= current_time]
            for t in new_arrivals:
                ready_queue.append(task_states[t.id])
                unarrived.remove(t)

            if not ready_queue:
                # Advance time to next arrival if all ready queues are empty and no VM busy
                available_vms = [v for v in vms if v.available_at <= current_time]
                if len(available_vms) == len(vms) and unarrived:
                    current_time = min(t.arrival_time for t in unarrived)
                    continue
                else:
                    current_time = min(v.available_at for v in vms if v.available_at > current_time)
                    continue

            # Assign task to earliest available VM
            best_vm = min(vms, key=lambda v: v.available_at)
            slice_start = max(current_time, best_vm.available_at)

            current_task_state = ready_queue.pop(0)
            t_obj = current_task_state.task

            if not current_task_state.has_started:
                t_obj.start_time = slice_start
                t_obj.first_execution_time = slice_start
                t_obj.response_time = slice_start - t_obj.arrival_time
                current_task_state.has_started = True

            slice_duration = min(self.time_quantum if hasattr(self, 'time_quantum') else time_quantum, current_task_state.remaining_burst)
            actual_exec_duration = slice_duration / best_vm.speed_factor
            slice_finish = slice_start + actual_exec_duration

            current_task_state.remaining_burst -= slice_duration
            best_vm.available_at = slice_finish
            best_vm.busy_time += actual_exec_duration

            timeline.append({
                "task_id": t_obj.id,
                "task_name": t_obj.name,
                "vm_id": best_vm.id,
                "start_time": round(slice_start, 2),
                "finish_time": round(slice_finish, 2),
                "duration": round(actual_exec_duration, 2)
            })

            # Check new arrivals during slice execution before re-queuing
            mid_arrivals = [t for t in unarrived if t.arrival_time <= slice_finish]
            for t in mid_arrivals:
                ready_queue.append(task_states[t.id])
                unarrived.remove(t)

            if current_task_state.remaining_burst > 0.001:
                ready_queue.append(current_task_state)
            else:
                t_obj.finish_time = slice_finish
                t_obj.turnaround_time = slice_finish - t_obj.arrival_time
                t_obj.waiting_time = t_obj.turnaround_time - t_obj.actual_burst_time
                t_obj.vm_id = best_vm.id
                completed_count += 1

            current_time = slice_finish

        return self._build_result("Round Robin (RR)", tasks, vms, timeline)

    def run_priority_aging(self, raw_tasks, num_vms=3, aging_factor=0.2):
        """
        Priority Scheduling with Dynamic Aging to prevent starvation.
        Lower priority value = higher priority. Effective priority increases as wait time accumulates.
        """
        tasks = self._clone_tasks(raw_tasks)
        vms = self._clone_vms(num_vms)

        unprocessed = copy.deepcopy(tasks)
        processed_tasks = []
        timeline = []
        current_time = 0.0

        while unprocessed:
            arrived = [t for t in unprocessed if t.arrival_time <= current_time]
            if not arrived:
                current_time = min(t.arrival_time for t in unprocessed)
                arrived = [t for t in unprocessed if t.arrival_time <= current_time]

            # Calculate dynamic priority with aging: dynamic_priority = original_priority - (wait_time * aging_factor)
            def effective_priority(task):
                wait_duration = max(0.0, current_time - task.arrival_time)
                return task.priority - (wait_duration * aging_factor)

            arrived.sort(key=lambda t: (effective_priority(t), t.arrival_time))
            next_task = arrived[0]

            best_vm = min(vms, key=lambda v: v.available_at)
            start = max(next_task.arrival_time, best_vm.available_at)
            exec_time = next_task.actual_burst_time / best_vm.speed_factor
            finish = start + exec_time

            next_task.start_time = start
            next_task.finish_time = finish
            next_task.first_execution_time = start
            next_task.waiting_time = start - next_task.arrival_time
            next_task.turnaround_time = finish - next_task.arrival_time
            next_task.response_time = start - next_task.arrival_time
            next_task.vm_id = best_vm.id

            best_vm.available_at = finish
            best_vm.busy_time += exec_time

            timeline.append({
                "task_id": next_task.id,
                "task_name": next_task.name,
                "vm_id": best_vm.id,
                "start_time": round(start, 2),
                "finish_time": round(finish, 2),
                "duration": round(exec_time, 2)
            })

            processed_tasks.append(next_task)
            unprocessed = [t for t in unprocessed if t.id != next_task.id]
            current_time = min(v.available_at for v in vms)

        return self._build_result("Priority (Dynamic Aging)", processed_tasks, vms, timeline)


    def _build_result(self, algo_name, tasks, vms, timeline):
        """Calculates OS summary statistics, Jain's Fairness, Energy Consumption, and Cloud Cost."""
        if not tasks:
            return {
                "algorithm": algo_name,
                "avg_turnaround_time": 0,
                "avg_waiting_time": 0,
                "avg_response_time": 0,
                "cpu_utilization": 0,
                "throughput": 0,
                "jains_fairness_index": 1.0,
                "energy_kwh": 0.0,
                "estimated_cost_usd": 0.0,
                "server_load_distribution": {},
                "priority_breakdown": {},
                "tasks": [],
                "timeline": []
            }

        total_att = sum(t.turnaround_time for t in tasks)
        total_awt = sum(t.waiting_time for t in tasks)
        total_art = sum(t.response_time for t in tasks)
        n = len(tasks)

        max_finish_time = max(t.finish_time for t in tasks) if tasks else 1.0
        min_arrival_time = min(t.arrival_time for t in tasks) if tasks else 0.0
        total_simulation_duration = max(0.1, max_finish_time - min_arrival_time)

        total_busy = sum(v.busy_time for v in vms)
        total_capacity = len(vms) * total_simulation_duration
        cpu_utilization = (total_busy / total_capacity * 100) if total_capacity > 0 else 0

        throughput = (n / total_simulation_duration * 60) if total_simulation_duration > 0 else 0

        # Jain's Fairness Index on Wait Time: J = (sum(x_i))^2 / (n * sum(x_i^2))
        # Lower wait time variation = higher fairness (closer to 1.0)
        norm_waits = [max(0.01, t.waiting_time) for t in tasks]
        sum_w = sum(norm_waits)
        sum_sq_w = sum(w ** 2 for w in norm_waits)
        jains_fairness = (sum_w ** 2) / (n * sum_sq_w) if sum_sq_w > 0 else 1.0

        # Cloud Energy Model: Active VM = 220W, Idle VM = 45W
        # E(kWh) = (P_busy * t_busy + P_idle * t_idle) / 3,600,000
        total_idle = max(0.0, total_capacity - total_busy)
        energy_kwh = ((220.0 * total_busy) + (45.0 * total_idle)) / 3600000.0

        # Cloud Cost Model: Standard AWS/GCP c6i.xlarge pricing at $0.17 / hour / VM
        cost_usd = (total_simulation_duration / 3600.0) * len(vms) * 0.170

        # Server Load Distribution (%)
        server_load = {}
        for v in vms:
            share = (v.busy_time / total_busy * 100.0) if total_busy > 0 else (100.0 / len(vms))
            server_load[v.id] = {
                "name": v.name,
                "busy_time": round(v.busy_time, 2),
                "load_percentage": round(share, 1)
            }

        # Task Priority Breakdown
        priority_breakdown = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for t in tasks:
            priority_breakdown[t.priority] = priority_breakdown.get(t.priority, 0) + 1

        return {
            "algorithm": algo_name,
            "avg_turnaround_time": round(total_att / n, 2),
            "avg_waiting_time": round(total_awt / n, 2),
            "avg_response_time": round(total_art / n, 2),
            "cpu_utilization": round(min(100.0, cpu_utilization), 1),
            "throughput_tasks_per_min": round(throughput, 1),
            "jains_fairness_index": round(jains_fairness, 3),
            "energy_kwh": round(energy_kwh, 5),
            "estimated_cost_usd": round(cost_usd, 5),
            "server_load_distribution": server_load,
            "priority_breakdown": priority_breakdown,
            "total_simulation_time": round(total_simulation_duration, 2),
            "tasks": [t.to_dict() for t in tasks],
            "timeline": timeline
        }


    def compare_all(self, raw_tasks, num_vms=3, time_quantum=4.0):
        """Runs side-by-side benchmark comparison for Standard FCFS, FCFS-JSQ, SJF, RR, Priority Aging, DP-FCFS, and DP-FCFS+Shield."""
        fcfs_res = self.run_fcfs(raw_tasks, num_vms)
        fcfs_jsq_res = self.run_fcfs_jsq(raw_tasks, num_vms)
        sjf_res = self.run_sjf_non_preemptive(raw_tasks, num_vms)
        rr_res = self.run_round_robin(raw_tasks, num_vms, time_quantum=time_quantum)
        priority_res = self.run_priority_aging(raw_tasks, num_vms)
        dp_fcfs_res = self.run_dp_fcfs(raw_tasks, num_vms)
        dp_shield_res = self.run_dp_fcfs_shield(raw_tasks, num_vms)

        # Calculate improvement percentages over Standard FCFS
        fcfs_att = max(0.1, fcfs_res['avg_turnaround_time'])
        fcfs_awt = max(0.1, fcfs_res['avg_waiting_time'])

        att_improvement = round(((fcfs_att - dp_shield_res['avg_turnaround_time']) / fcfs_att) * 100, 1)
        awt_improvement = round(((fcfs_awt - dp_shield_res['avg_waiting_time']) / fcfs_awt) * 100, 1)

        return {
            "comparison": [
                {
                    "algorithm": "Standard FCFS",
                    "avg_turnaround_time": fcfs_res['avg_turnaround_time'],
                    "avg_waiting_time": fcfs_res['avg_waiting_time'],
                    "avg_response_time": fcfs_res['avg_response_time'],
                    "cpu_utilization": fcfs_res['cpu_utilization'],
                    "throughput": fcfs_res['throughput_tasks_per_min'],
                    "jains_fairness_index": fcfs_res['jains_fairness_index'],
                    "energy_kwh": fcfs_res['energy_kwh'],
                    "estimated_cost_usd": fcfs_res['estimated_cost_usd']
                },
                {
                    "algorithm": "FCFS-JSQ (Reactive)",
                    "avg_turnaround_time": fcfs_jsq_res['avg_turnaround_time'],
                    "avg_waiting_time": fcfs_jsq_res['avg_waiting_time'],
                    "avg_response_time": fcfs_jsq_res['avg_response_time'],
                    "cpu_utilization": fcfs_jsq_res['cpu_utilization'],
                    "throughput": fcfs_jsq_res['throughput_tasks_per_min'],
                    "jains_fairness_index": fcfs_jsq_res['jains_fairness_index'],
                    "energy_kwh": fcfs_jsq_res['energy_kwh'],
                    "estimated_cost_usd": fcfs_jsq_res['estimated_cost_usd']
                },
                {
                    "algorithm": "Non-Preemptive SJF",
                    "avg_turnaround_time": sjf_res['avg_turnaround_time'],
                    "avg_waiting_time": sjf_res['avg_waiting_time'],
                    "avg_response_time": sjf_res['avg_response_time'],
                    "cpu_utilization": sjf_res['cpu_utilization'],
                    "throughput": sjf_res['throughput_tasks_per_min'],
                    "jains_fairness_index": sjf_res['jains_fairness_index'],
                    "energy_kwh": sjf_res['energy_kwh'],
                    "estimated_cost_usd": sjf_res['estimated_cost_usd']
                },
                {
                    "algorithm": "Round Robin (RR)",
                    "avg_turnaround_time": rr_res['avg_turnaround_time'],
                    "avg_waiting_time": rr_res['avg_waiting_time'],
                    "avg_response_time": rr_res['avg_response_time'],
                    "cpu_utilization": rr_res['cpu_utilization'],
                    "throughput": rr_res['throughput_tasks_per_min'],
                    "jains_fairness_index": rr_res['jains_fairness_index'],
                    "energy_kwh": rr_res['energy_kwh'],
                    "estimated_cost_usd": rr_res['estimated_cost_usd']
                },
                {
                    "algorithm": "Priority (Dynamic Aging)",
                    "avg_turnaround_time": priority_res['avg_turnaround_time'],
                    "avg_waiting_time": priority_res['avg_waiting_time'],
                    "avg_response_time": priority_res['avg_response_time'],
                    "cpu_utilization": priority_res['cpu_utilization'],
                    "throughput": priority_res['throughput_tasks_per_min'],
                    "jains_fairness_index": priority_res['jains_fairness_index'],
                    "energy_kwh": priority_res['energy_kwh'],
                    "estimated_cost_usd": priority_res['estimated_cost_usd']
                },
                {
                    "algorithm": "DP-FCFS (Base)",
                    "avg_turnaround_time": dp_fcfs_res['avg_turnaround_time'],
                    "avg_waiting_time": dp_fcfs_res['avg_waiting_time'],
                    "avg_response_time": dp_fcfs_res['avg_response_time'],
                    "cpu_utilization": dp_fcfs_res['cpu_utilization'],
                    "throughput": dp_fcfs_res['throughput_tasks_per_min'],
                    "jains_fairness_index": dp_fcfs_res['jains_fairness_index'],
                    "energy_kwh": dp_fcfs_res['energy_kwh'],
                    "estimated_cost_usd": dp_fcfs_res['estimated_cost_usd']
                },
                {
                    "algorithm": "DP-FCFS + Shield (N1-N3)",
                    "avg_turnaround_time": dp_shield_res['avg_turnaround_time'],
                    "avg_waiting_time": dp_shield_res['avg_waiting_time'],
                    "avg_response_time": dp_shield_res['avg_response_time'],
                    "cpu_utilization": dp_shield_res['cpu_utilization'],
                    "throughput": dp_shield_res['throughput_tasks_per_min'],
                    "jains_fairness_index": dp_shield_res['jains_fairness_index'],
                    "energy_kwh": dp_shield_res['energy_kwh'],
                    "estimated_cost_usd": dp_shield_res['estimated_cost_usd']
                }
            ],
            "details": {
                "standard_fcfs": fcfs_res,
                "fcfs": fcfs_res,
                "fcfs_static": fcfs_res,
                "fcfs_jsq": fcfs_jsq_res,
                "jsq": fcfs_jsq_res,
                "sjf_non_preemptive": sjf_res,
                "sjf": sjf_res,
                "sjf_oracle": sjf_res,
                "round_robin": rr_res,
                "rr": rr_res,
                "priority_aging": priority_res,
                "priority": priority_res,
                "dp_fcfs": dp_fcfs_res,
                "dp": dp_fcfs_res,
                "dp_fcfs_shield": dp_shield_res,
                "dp_shield": dp_shield_res,
                "shield": dp_shield_res
            },
            "summary_metrics": {
                "att_reduction_pct": att_improvement,
                "awt_reduction_pct": awt_improvement,
                "convoy_mitigation_effective": True
            }
        }

# Global instance
scheduler_engine = CloudSchedulerEngine()

