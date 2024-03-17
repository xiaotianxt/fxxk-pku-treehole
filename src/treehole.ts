interface Thread {
  pid: number;
  text: string;
  type: "text";
  timestamp: number;
  reply: number | string;
  likenum: number | string;
  extra: number;
  anonymous: number;
  is_top: number;
  label: number;
  status: number;
  is_comment: number;
  tag: string;
  is_follow: number;
  is_protect: number;
  image_size: [number, number];
  label_info: null;
}

interface TreeHoleRes {
  code: number;
  data: {
    data: Thread[];
  };
}

const LS_KEY = "NEVERGONNAGIVEYOUUP";

export class Log {
  map: Map<number, Thread>;
  maxPid: number = -1;

  constructor() {
    // Retrieve JSON data from localStorage
    const jsonData = localStorage.getItem(LS_KEY) || "[]";

    // Initialize a new Map object
    this.map = new Map(JSON.parse(jsonData));
  }

  replace(data: TreeHoleRes, pid: string | null): TreeHoleRes {
    const threads = data?.data?.data || [];

    if (!threads.length) {
      if (pid && this.map.has(Number(pid))) {
        threads.splice(0, 0, this.map.get(Number(pid)) as Thread);
      }
      return data;
    }

    // First, remember all threads
    threads.forEach((t) => this.map.set(t.pid, t));
    this.save();

    let i = 0;
    let j = threads[0].pid;

    // Detect censored thread, try to recover them
    while (i < threads.length) {
      const thread = threads[i];

      if (thread.pid != j) {
        if (this.map.has(j)) {
          const recoveredThread = this.map.get(j) as Thread;
          recoveredThread.text = "[⚠️被删除的树洞]" + recoveredThread.text;
          threads.splice(i, 0, recoveredThread);
        } else {
          threads.splice(i, 0, {
            ...thread,
            pid: j,
            text: "⚠️ 本树洞被删除了",
            reply: "NaN",
            likenum: "NaN",
          });
        }
        j -= 1;
        i += 1;
        continue;
      }

      j -= 1;
      i += 1;
    }

    return data;
  }

  async save() {
    console.log(JSON.stringify(Array.from(this.map)));
    localStorage.setItem(LS_KEY, JSON.stringify(Array.from(this.map)));
  }
}
